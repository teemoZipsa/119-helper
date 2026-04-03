/**
 * 민방위대피시설 조회 API 프록시
 * Route: GET /api/civil-shelter?ctprvnNm=서울특별시&pageNo=1&numOfRows=100
 * 
 * Endpoint: https://apis.data.go.kr/1741000/civil_defense_shelter_info/info
 */

export async function handleCivilShelter(url: URL, apiKey: string): Promise<{ data: unknown; cacheTtl: number }> {
  const ctprvnNm = url.searchParams.get('ctprvnNm') || '';
  const sgnNm = url.searchParams.get('sgnNm') || '';
  const pageNo = url.searchParams.get('pageNo') || '1';
  const numOfRows = url.searchParams.get('numOfRows') || '100';

  const params = new URLSearchParams({
    serviceKey: apiKey,
    pageNo,
    numOfRows,
    type: 'json',
  });
  if (ctprvnNm) params.set('ctprvnNm', ctprvnNm);
  if (sgnNm) params.set('sgnNm', sgnNm);

  const res = await fetch(
    `https://apis.data.go.kr/1741000/civil_defense_shelter_info/info?${params}`,
    { headers: { 'User-Agent': '119-helper-worker/1.0' } }
  );
  if (!res.ok) throw new Error(`Civil Shelter API ${res.status}`);
  const json: any = await res.json();
  
  // 응답 구조: { response: { body: { items: [...], totalCount: N } } } 또는 직접 배열
  const items = json?.response?.body?.items
    || json?.body?.items
    || json?.data
    || json?.items
    || (Array.isArray(json) ? json : []);

  return { data: items, cacheTtl: 86400 }; // 24시간 캐시
}
