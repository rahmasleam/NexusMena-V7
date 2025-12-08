
import { NewsItem, ResourceItem, PodcastItem } from '../types';

const CORS_PROXY = "https://corsproxy.io/?";

const IMPORTANT_KEYWORDS = [
    'launch', 'unveil', 'acquire', 'acquisition', 'billion', 'million', 
    'ipo', 'series a', 'series b', 'unicorn', 'funding', 'raise', 
    'apple', 'google', 'openai', 'meta', 'nvidia', 'amazon', 'egypt', 'saudi'
];

const extractImage = (content: string): string => {
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    return imgMatch ? imgMatch[1] : `https://picsum.photos/800/400?random=${Math.random()}`;
};

// New helper to identify sector/field
const identifySector = (text: string): any => {
    const lower = text.toLowerCase();
    if (lower.includes('fintech') || lower.includes('bank') || lower.includes('payment')) return 'Fintech';
    if (lower.includes('ai ') || lower.includes('artificial intelligence') || lower.includes('llm')) return 'AI';
    if (lower.includes('health') || lower.includes('medtech')) return 'Healthtech';
    if (lower.includes('proptech') || lower.includes('real estate')) return 'Proptech';
    if (lower.includes('e-commerce') || lower.includes('retail')) return 'E-commerce';
    if (lower.includes('saas') || lower.includes('cloud')) return 'SaaS';
    if (lower.includes('deep tech') || lower.includes('biotech')) return 'Deep Tech';
    
    if (lower.includes('invest') || lower.includes('fund') || lower.includes('venture')) return 'Investment';
    if (lower.includes('tech') || lower.includes('software') || lower.includes('hardware')) return 'Technology';
    if (lower.includes('startup') || lower.includes('founder') || lower.includes('entrepreneur')) return 'Entrepreneurship';
    if (lower.includes('business') || lower.includes('market') || lower.includes('stock')) return 'Business';
    
    return 'General';
};

export const fetchAndProcessFeeds = async (resources: ResourceItem[]): Promise<{ latest: NewsItem[], startups: Record<string, NewsItem[]>, podcasts: PodcastItem[] }> => {
    const allArticles: NewsItem[] = [];
    const startupsGrouped: Record<string, NewsItem[]> = {};
    const allPodcasts: PodcastItem[] = [];

    // 1. Filter only resources that have a valid RSS URL
    const validFeeds = resources.filter(r => r.rssUrl && r.rssUrl.length > 5);

    // 2. Initialize groups
    validFeeds.forEach(f => {
        if (f.type !== 'Podcast') {
            startupsGrouped[f.name] = [];
        }
    });

    console.log(`Fetching from ${validFeeds.length} RSS feeds...`);

    const promises = validFeeds.map(async (feed) => {
        try {
            if (!feed.rssUrl) return;
            // @ts-ignore
            const response = await fetch(`${CORS_PROXY}${encodeURIComponent(feed.rssUrl)}`);
            if (!response.ok) return;
            const text = await response.text();
            const xml = new DOMParser().parseFromString(text, "text/xml");
            
            // Handle both RSS <item> and Atom/YouTube <entry>
            const items = Array.from(xml.querySelectorAll("item, entry"));

            items.forEach(item => {
                const title = item.querySelector("title")?.textContent || "";
                
                // Link extraction (Atom uses href attribute, RSS uses text content)
                let link = item.querySelector("link")?.textContent || "";
                if (!link) {
                    const linkNode = item.querySelector("link");
                    if (linkNode && linkNode.getAttribute("href")) {
                        link = linkNode.getAttribute("href")!;
                    }
                }

                // Date extraction
                const pubDateStr = item.querySelector("pubDate")?.textContent || item.querySelector("published")?.textContent || "";
                let date = new Date().toISOString().split('T')[0];
                if (pubDateStr) {
                    try {
                        date = new Date(pubDateStr).toISOString().split('T')[0];
                    } catch (e) {}
                }

                // Description extraction (media:group for YouTube, description for RSS)
                let desc = item.querySelector("description")?.textContent || "";
                const mediaGroup = item.getElementsByTagName("media:group")[0];
                if (mediaGroup) {
                    const mediaDesc = mediaGroup.getElementsByTagName("media:description")[0];
                    if (mediaDesc) desc = mediaDesc.textContent || "";
                }
                
                // Cleanup
                const cleanTitle = title.replace('<![CDATA[', '').replace(']]>', '').trim();
                const cleanDesc = desc.replace(/<[^>]*>/g, '').substring(0, 200) + "...";
                
                // --- PODCAST / YOUTUBE LOGIC ---
                if (feed.type === 'Podcast') {
                    const videoIdNode = item.getElementsByTagName("yt:videoId")[0];
                    const videoId = videoIdNode ? videoIdNode.textContent : null;
                    
                    let youtubeUrl = undefined;
                    let audioUrl = undefined;
                    let imageUrl = `https://picsum.photos/800/400?random=${Math.random()}`;

                    // YouTube specific
                    if (videoId) {
                        youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
                        imageUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                    } else {
                        // Standard Audio Podcast
                        const enclosure = item.querySelector("enclosure");
                        if (enclosure && enclosure.getAttribute("type")?.includes("audio")) {
                            audioUrl = enclosure.getAttribute("url") || undefined;
                        }
                        // Try extracting image
                        const itunesImage = item.getElementsByTagName("itunes:image")[0];
                        if (itunesImage && itunesImage.getAttribute("href")) {
                            imageUrl = itunesImage.getAttribute("href")!;
                        } else {
                             imageUrl = extractImage(desc);
                        }
                    }

                    const podcastItem: PodcastItem = {
                        id: `pod_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                        title: cleanTitle,
                        description: cleanDesc,
                        url: link,
                        source: feed.name,
                        date: date,
                        region: 'Global',
                        imageUrl: imageUrl,
                        duration: 'N/A',
                        summaryPoints: [],
                        language: 'en',
                        topic: 'Tech',
                        youtubeUrl: youtubeUrl,
                        audioUrl: audioUrl,
                        channelUrl: feed.url
                    };
                    
                    allPodcasts.push(podcastItem);
                    return; // Done with podcast item
                }


                // --- NEWS / STARTUP LOGIC ---
                const fullText = (cleanTitle + " " + cleanDesc).toLowerCase();
                const isRelevant = /tech|startup|fund|invest|business|ai|finance|money|market|egypt|mena/.test(fullText);
                
                if (!isRelevant) return;

                // Determine Region
                let region = 'Global';
                if (feed.url.includes('.eg') || feed.name.includes('Egypt') || feed.name.includes('Mal')) region = 'Egypt';
                else if (feed.name.includes('Wamda') || feed.name.includes('MENA')) region = 'MENA';

                const sector = identifySector(fullText);

                const newsItem: NewsItem = {
                    id: `rss_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    title: cleanTitle,
                    description: cleanDesc,
                    url: link,
                    source: feed.name,
                    date: date,
                    region: region as any,
                    category: 'Tech',
                    sector: sector,
                    imageUrl: extractImage(desc),
                    tags: [sector]
                };

                // Add to "All" list for Latest page
                allArticles.push(newsItem);

                // Add to Grouped list for Startups Page
                if (startupsGrouped[feed.name]) {
                    startupsGrouped[feed.name].push({ ...newsItem, category: 'Startup' });
                }
            });
        } catch (e) {
            console.error(`Error fetching ${feed.name}`, e);
        }
    });

    await Promise.all(promises);

    // --- LATEST PAGE LOGIC ---
    allArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const scoredArticles = allArticles.map(item => {
        let score = 0;
        if (item.date === new Date().toISOString().split('T')[0]) score += 5;
        if (['TechCrunch', 'The Verge', 'PitchBook', 'Wired'].includes(item.source)) score += 3;
        if (IMPORTANT_KEYWORDS.some(k => item.title.toLowerCase().includes(k))) score += 4;
        return { item, score };
    });

    scoredArticles.sort((a, b) => b.score - a.score);
    const top12 = scoredArticles.slice(0, 12).map(x => x.item);

    return {
        latest: top12,
        startups: startupsGrouped,
        podcasts: allPodcasts
    };
};
