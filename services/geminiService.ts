
import { GoogleGenAI, Modality } from "@google/genai";
import { ChatMessage, NewsItem, TrendAnalysis } from '../types';

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API_KEY not found in environment variables");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

// Helper to robustly parse JSON from AI responses
const parseAIResponse = (text: string | undefined): any => {
    if (!text) return null;

    // 1. Remove Markdown code blocks
    let clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    // 2. Try direct parse
    try {
        return JSON.parse(clean);
    } catch (e) {
        // 3. Fallback: Extract JSON object or array using regex
        // Match either {...} or [...]
        const jsonMatch = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);

        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e2) {
                console.error("Regex JSON extraction failed:", e2);
            }
        }

        console.error("Failed to parse AI JSON. Raw text preview:", text.substring(0, 50) + "...");
        return null;
    }
};

export const generateSummary = async (text: string, lang: 'en' | 'ar'): Promise<string> => {
    const ai = getClient();
    if (!ai) return "AI Service Unavailable (Missing Key)";

    try {
        const prompt = lang === 'ar'
            ? `لخّص النص التقني التالي في 3 نقاط رئيسية باللغة العربية:\n\n${text}`
            : `Summarize the following tech content into 3 concise bullet points:\n\n${text}`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
        });

        return response.text || "Could not generate summary.";
    } catch (error: any) {
        console.error("Gemini Summary Error:", error);
        if (error?.status === 429 || error?.code === 429) {
            return "Limit Reached. Please try again in a few minutes.";
        }
        return "Error generating summary.";
    }
};

export const translateText = async (text: string, targetLang: 'en' | 'ar'): Promise<string> => {
    const ai = getClient();
    if (!ai) return text;

    try {
        const prompt = `Translate the following text to ${targetLang === 'ar' ? 'Arabic' : 'English'}. Keep technical terms accurate and maintain the formatting (Markdown tables, lists, etc):\n\n${text}`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
        });

        return response.text || text;
    } catch (error) {
        console.error("Gemini Translation Error:", error);
        return text;
    }
};

export const analyzeMarketData = async (dataContext: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "AI Analysis Unavailable";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `You are a financial analyst specializing in Egyptian and Global tech markets. Analyze this data snapshot and give 2 sentences of insight:\n${dataContext}`,
        });
        return response.text || "No insights available.";
    } catch (e: any) {
        if (e?.status === 429) return "Market Analysis: Live data stream paused (Quota).";
        return "Could not analyze market data.";
    }
}

export const generateSpeech = async (text: string): Promise<string | null> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return null;
        return base64Audio;

    } catch (error) {
        console.error("Gemini TTS Error:", error);
        return null;
    }
}

export const analyzePodcast = async (url: string): Promise<any> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        const prompt = `
        You are a Podcast Analyst API.
        Target: Analyze the content at this link: ${url}. 

        Task:
        1. Use Google Search to find details/transcript/summary of this podcast episode.
        2. Perform the analysis below.
        3. Output VALID JSON only.

        Metrics to analyze:
        - Depth of Information
        - Technical Level
        - Authenticity
        - Speakers' Expertise
        - Clarity
        - Engagement
        - Relevance
        - Bias and Objectivity
        - Practical Applications
        - Pacing
        - Emotional Impact
        - Originality

        **JSON OUTPUT FORMAT**:
        {
            "podcastName": "string",
            "episodeTitle": "string",
            "score": 8,
            "summary": "string (A concise paragraph)",
            "metrics": [
                { "name": "Depth of Information", "finding": "string" },
                ... (repeat for all metrics)
            ],
            "recommendation": "string"
        }
        
        If you cannot access the link, try to find the podcast by searching its likely title in the URL.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        const parsed = parseAIResponse(response.text);
        if (parsed) return parsed;

        return {
            podcastName: "Analysis Failed",
            episodeTitle: "Error",
            score: 0,
            summary: "Could not generate structured analysis. The AI response was not valid JSON.",
            metrics: [],
            recommendation: "Please try again."
        };

    } catch (error: any) {
        console.error("Deep Analysis Error:", error);
        if (error?.status === 429 || error?.code === 429) {
            alert("Rate Limit Exceeded. Please wait a moment.");
        }
        return null;
    }
};

export const analyzeTrends = async (articles: NewsItem[]): Promise<TrendAnalysis | null> => {
    const ai = getClient();
    if (!ai) return null;

    if (articles.length === 0) return null;

    // Create a compact list of titles/descriptions to send to AI
    const articleContext = articles.map(a => `- ${a.title}: ${a.description}`).join('\n');

    try {
        const prompt = `
        You are a Chief Editor for a major Tech Publication.
        
        Task: Analyze the following list of news headlines collected TODAY.
        Identify the most popular topics across these specific categories:
        1. Business
        2. Finance
        3. Technology
        4. AI
        5. Entrepreneurship
        6. Investment

        INPUT DATA:
        ${articleContext}

        INSTRUCTIONS:
        - Synthesize the information. Don't just list headlines. Find the *theme* (e.g., "Generative AI Regulation" or "Fintech Consolidation").
        - Provide a concise summary for each topic.
        - Determine the general sentiment (Positive/Neutral/Mixed).
        - Write a 2-sentence Executive Summary of the day's tech landscape.

        **JSON OUTPUT FORMAT**:
        {
            "date": "${new Date().toISOString().split('T')[0]}",
            "executiveSummary": "string",
            "topics": [
                { "category": "AI", "topic": "string", "summary": "string", "sentiment": "string" },
                { "category": "Business", "topic": "string", "summary": "string", "sentiment": "string" },
                { "category": "Finance", "topic": "string", "summary": "string", "sentiment": "string" },
                { "category": "Technology", "topic": "string", "summary": "string", "sentiment": "string" },
                { "category": "Entrepreneurship", "topic": "string", "summary": "string", "sentiment": "string" },
                { "category": "Investment", "topic": "string", "summary": "string", "sentiment": "string" }
            ]
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        return parseAIResponse(response.text);

    } catch (error: any) {
        console.error("Trend Analysis Error:", error);
        // Return null on rate limit to prevent crashing
        if (error?.status === 429 || error?.code === 429) {
            console.warn("Trend Analysis Rate Limit Hit - Skipping analysis");
        }
        return null;
    }
};

export const fetchLatestFromSource = async (url: string): Promise<any> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        const prompt = `
        You are a Content Discovery API.
        Target Source: ${url}
        
        Task: Find the SINGLE latest news article or podcast episode from this source using Google Search.
        
        Instructions:
        1. Search for "latest news ${url} ${new Date().getFullYear()}" or "latest episode ${url}".
        2. Identify the most recent item (must be from last 7 days).
        3. Return ONLY a JSON object. Do not converse.
        
        JSON Format:
        {
           "title": "string",
           "description": "string",
           "source": "string (Source Name)",
           "specificUrl": "https://valid-deep-link", 
           "date": "YYYY-MM-DD",
           "category": "string (latest, startup, podcasts, events)",
           "duration": "string (optional)",
           "summaryPoints": ["point 1", "point 2"],
           "youtubeUrl": "string (optional)",
           "spotifyUrl": "string (optional)"
        }
        
        If no specific item is found, return null.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        const parsed = parseAIResponse(response.text);

        if (parsed) {
            if (parsed.specificUrl === url || (parsed.specificUrl && !parsed.specificUrl.includes('/'))) {
                console.warn("AI returned homepage, invalid deep link.");
            }
            return parsed;
        }

        return null;

    } catch (error: any) {
        console.error("Smart Fetch Error:", error);
        if (error?.status === 429 || error?.code === 429) {
            alert("System is busy (Rate Limit). Please try again in a minute.");
        }
        return null;
    }
};

// NEW: Batch scraper for multiple articles
export const scrapeSiteForNewestArticles = async (url: string, sourceName: string): Promise<any[]> => {
    const ai = getClient();
    if (!ai) return [];

    try {
        // UPDATED PROMPT: Specific topics and Today's date enforcement
        const prompt = `
        You are a Real-Time News Aggregator.
        Target: ${sourceName} (${url})
        
        Task: Find the top 2 most recent articles from this source published TODAY or YESTERDAY.
        
        Focus Topics:
        - Business
        - Finance
        - Technology
        - AI (Artificial Intelligence)
        - Entrepreneurship
        - Investment
        
        Internal Search Strategy:
        - Use Google Search to find: "latest ${sourceName} articles Business Technology AI"
        - Filter results for publication date within the last 24 hours.
        
        **JSON OUTPUT FORMAT**:
        [
            { 
              "title": "string", 
              "summary": "string", 
              "date": "YYYY-MM-DD", 
              "url": "https://valid-deep-link-to-article", 
              "source": "${sourceName}" 
            }
        ]
        
        Return ONLY valid JSON. If no *recent* (last 48h) articles are found, return empty array [].
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        const parsed = parseAIResponse(response.text);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return [];

    } catch (error: any) {
        // Handle 429 Rate Limit Gracefully
        if (error?.status === 429 || error?.code === 429) {
            console.warn(`Rate Limit Hit for ${sourceName} - Skipping`);
            return []; // Return empty so the app continues loading other sources
        }
        console.error("Batch Scrape Error:", error);
        return [];
    }
}

export const getArticleContent = async (url: string, searchContext?: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "AI Service Unavailable";

    try {
        const prompt = `
        Source URL: ${url}
        Context: ${searchContext || ''}
        
        Task: Retrieve the full content of this article.
        
        Strategy:
        1. If you can read the URL directly, do so.
        2. If not, use Google Search to find the article by title ("${searchContext}") and synthesize the FULL article text from the search results and snippets.
        3. Do NOT just give a summary. Try to reconstruct the article structure (Headings, paragraphs).
        4. Format as clean Markdown.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        return response.text || "Could not retrieve article content. Try opening the original link.";
    } catch (error) {
        console.error("Article Extraction Error:", error);
        return "Error extracting article content.";
    }
};

export const fetchRealMarketData = async (): Promise<any> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        const prompt = `
        You are a Real-Time Market Data API.
        CURRENT SYSTEM DATE: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })}
        
        Task: Get specific market rates for Egypt and Global Tech for TODAY.
        STRICT SOURCE REQUIREMENT: You MUST use data from Google Finance (https://www.google.com/finance).
        
        Search Strategy:
        - Search for "USD to EGP Google Finance"
        - Search for "Gold Price Egypt 21k Google Finance"
        - Search for "NASDAQ Index Google Finance"
        - Search for "Bitcoin Price USD Google Finance"
        
        Retrieve the following LIVE values:
        1. USD to EGP (Official Bank Rate)
        2. Gold Price in Egypt (21k per gram)
        3. NASDAQ Composite Index (Current live value)
        4. Bitcoin (BTC) Price in USD (Live - Expect approx 90,000-105,000 range. Do NOT return the daily change.)
        5. Ethereum (ETH) Price in USD (Live)
        6. NVIDIA Stock (NVDA) Price (Live)
        
        Output JSON Format ONLY:
        {
            "egpRate": { "value": number, "change": number (daily change), "trend": "up/down/neutral" },
            "goldEg": { "value": number, "trend": "up/down" },
            "nasdaq": { "value": number, "change": number, "trend": "up/down" },
            "btc": { "value": number, "change": number, "trend": "up/down" },
            "marketSummary": "2 short sentences: 1 on Global Tech Market status, 1 on Egyptian Currency/Gold status, citing current Google Finance values."
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        return parseAIResponse(response.text);

    } catch (error) {
        console.error("Market Data Fetch Error:", error);
        return null; // Fallback to mock data in UI if this fails
    }
};

export const reviewContent = async (data: any): Promise<any> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        const prompt = `
        You are an expert editor. Review this submission:
        Title: ${data.title || data.name}
        Desc: ${data.description}
        
        Task: Improve grammar, catchiness, and conciseness.
        
        Output JSON Only:
        {
            "improvedTitle": "string",
            "improvedDescription": "string",
            "feedback": "string"
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        return parseAIResponse(response.text);
    } catch (error) {
        console.error("Content Review Error:", error);
        return null;
    }
};

export const sendMessageToAssistant = async (
    history: ChatMessage[],
    newMessage: string,
    contextData?: string
): Promise<string> => {
    const ai = getClient();
    if (!ai) return "I'm sorry, I cannot connect to the AI service right now. Please check your API key.";

    try {
        const systemInstruction = `You are NexusMena AI, a specialized assistant for the NexusMena tech platform. 
    You have access to Global and Egyptian tech news, startups, events, and market data.
    Your goal is to help users find information within the platform, summarize articles, or explain complex tech/financial concepts.
    Be concise, professional, and helpful. 
    If provided with Context Data, prioritize that information.
    Answer in the language the user speaks (English or Arabic).`;

        const chat = ai.chats.create({
            model: 'gemini-1.5-flash',
            config: {
                systemInstruction,
            },
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.content }]
            }))
        });

        let messageToSend = newMessage;
        if (contextData) {
            messageToSend = `[Context from current page: ${contextData}]\n\nUser Question: ${newMessage}`;
        }

        const result = await chat.sendMessage({ message: messageToSend });
        return result.text;

    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "I encountered an error processing your request.";
    }
};
