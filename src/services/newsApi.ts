const API_BASE = import.meta.env.VITE_API_BASE || 'https://119-helper-api.teemozipsa.workers.dev';

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
  isOfficial?: boolean;
}

async function fetchRssAndParse(url: string, sourceName: string, isOfficial: boolean, limit: number): Promise<any[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, limit);
    
    return items.map(item => {
      let desc = item.querySelector('description')?.textContent || '';
      desc = desc.replace(/<[^>]+>/g, '').trim();
      
      let pubDateStr = item.querySelector('pubDate')?.textContent || item.querySelector('dc\\:date')?.textContent || item.querySelector('date')?.textContent || '';
      
      let actualSource = sourceName;
      if (!isOfficial) {
        actualSource = item.querySelector('source')?.textContent || sourceName;
      }

      return {
        id: item.querySelector('link')?.textContent || Math.random().toString(),
        title: item.querySelector('title')?.textContent || '',
        link: item.querySelector('link')?.textContent || '',
        pubDateStr,
        source: actualSource,
        description: desc,
        isOfficial
      };
    });
  } catch (err) {
    console.error(`RSS fetch error for ${url}:`, err);
    return [];
  }
}

function processAndSort(arrays: any[][]): NewsItem[] {
  const combined = arrays.flat().sort((a, b) => {
    const d1 = new Date(a.pubDateStr).getTime();
    const d2 = new Date(b.pubDateStr).getTime();
    if (isNaN(d1)) return 1;
    if (isNaN(d2)) return -1;
    return d2 - d1;
  });

  return combined.map(item => ({
    id: item.id,
    title: item.title,
    link: item.link,
    pubDate: new Date(item.pubDateStr).toLocaleString('ko-KR', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }),
    source: item.source,
    description: item.description,
    isOfficial: item.isOfficial
  }));
}

// 1. 현장/지역 뉴스 (구글뉴스 + 소방방재신문)
export async function fetchLocalNews(city: string): Promise<NewsItem[]> {
  try {
    const [gNews, fpnNews] = await Promise.all([
      fetchRssAndParse(`${API_BASE}/api/news?type=google&query=${encodeURIComponent(city + ' 소방')}`, 'Google News', false, 15),
      fetchRssAndParse(`${API_BASE}/api/news?type=google&query=${encodeURIComponent('site:fpn119.co.kr ' + city)}`, '소방방재신문', true, 5)
    ]);
    return processAndSort([gNews, fpnNews]);
  } catch (error) {
    console.error('Local News fetch error:', error);
    return [];
  }
}

// 2. 정책/법안 뉴스 (소방청 + 국회 + 행안부 + 보건복지부)
export async function fetchPolicyNews(): Promise<NewsItem[]> {
  try {
    // 4개 데이터 소스 동시 패치 (전부 구글 뉴스 고급검색 + RSS 프록시 활용)
    const [nfa, mois, mohw, assembly] = await Promise.all([
      fetchRssAndParse(`${API_BASE}/api/news?type=nfa`, '소방청(정책)', true, 8),
      fetchRssAndParse(`${API_BASE}/api/news?type=google&query=${encodeURIComponent('행정안전부 재난 OR 행정안전부 소방 정책')}`, '행정안전부', true, 4),
      fetchRssAndParse(`${API_BASE}/api/news?type=google&query=${encodeURIComponent('보건복지부 구급 OR 보건복지부 응급')}`, '보건복지부', true, 4),
      fetchRssAndParse(`${API_BASE}/api/news?type=google&query=${encodeURIComponent('국회 소방 법안 OR 119 개정안')}`, '국회(입법)', true, 4),
    ]);
    return processAndSort([nfa, mois, mohw, assembly]);
  } catch (error) {
    console.error('Policy News fetch error:', error);
    return [];
  }
}

// 3. 기상특보 글로벌 배너용 단일 파싱
export async function fetchWeatherAlerts(city?: string): Promise<NewsItem | null> {
  try {
    const query = city ? `기상특보 OR 날씨특보 발효 ${city}` : '기상특보 OR 날씨특보 발효';
    const alerts = await fetchRssAndParse(`${API_BASE}/api/news?type=google&query=${encodeURIComponent(query)}`, '기상청 특보', true, 3);
    const sorted = processAndSort([alerts]);
    if (sorted.length > 0) {
      // 12시간 이내의 특보만 유효하다고 판단
      const recent = new Date().getTime() - new Date(alerts[0].pubDateStr).getTime();
      if (recent < 12 * 60 * 60 * 1000) {
        return sorted[0];
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}
