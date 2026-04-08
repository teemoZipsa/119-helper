/**
 * 행정안전부 긴급재난문자 API 프록시
 * 
 * Route: GET /api/disaster-msg
 */

export async function handleDisasterMsg(url: URL, apiKey?: string): Promise<{ data: unknown; cacheTtl: number }> {
  const serviceKey = apiKey || 'X46QXE6KR1HU0RTN';
  const pageNo = url.searchParams.get('pageNo') || '1';
  const numOfRows = url.searchParams.get('numOfRows') || '20';
  
  const params = new URLSearchParams({
    serviceKey,
    returnType: 'json',
    numOfRows,
    pageNo,
  });

  const res = await fetch(
    `https://www.safetydata.go.kr/V2/api/DSSP-IF-00247?${params}`,
    { headers: { 'User-Agent': '119-helper-worker/1.0' } }
  );

  if (!res.ok) throw new Error(`DisasterMsg API ${res.status}`);
  const json: any = await res.json();
  const items = json?.body || [];

  // 캐시: 재난문자는 비교적 실시간성이 중요하지만, API 호출 제한 방지를 위해 3분 캐시
  return { data: items, cacheTtl: 180 };
}
