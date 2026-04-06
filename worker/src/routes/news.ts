export async function newsHandler(request: Request, env: any): Promise<Response> {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'google';

  try {
    let rssUrl = '';
    if (type === 'nfa') {
      rssUrl = 'https://www.korea.kr/rss/dept_nfa.xml';
    } else {
      const query = url.searchParams.get('query') || '소방관';
      rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
    }
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `News fetch failed: ${response.statusText}` }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const xmlText = await response.text();

    return new Response(xmlText, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=1800' // 30분 캐시
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
