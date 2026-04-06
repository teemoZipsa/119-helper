// 지진해일 긴급 대피장소 API 프록시
// Route: GET /api/shelter?ctprvnNm=경상북도&numOfRows=100&pageNo=1

export async function handleShelter(url: URL, apiKey: string): Promise<{ data: unknown; cacheTtl: number }> {
  const ctprvnNm = url.searchParams.get('ctprvnNm') || '';
  const signguNm = url.searchParams.get('signguNm') || '';
  const numOfRows = url.searchParams.get('numOfRows') || '100';
  const pageNo = url.searchParams.get('pageNo') || '1';

  const params = new URLSearchParams({
    serviceKey: apiKey,
    pageNo,
    numOfRows,
    type: 'json',
  });
  if (ctprvnNm) params.set('ctprvnNm', ctprvnNm);
  if (signguNm) params.set('signguNm', signguNm);

  // api.data.go.kr → HTTP 호출 (Cloudflare SSL 525 오류 방지)
  const res = await fetch(
    `http://api.data.go.kr/openapi/tn_pubr_public_shelter_api?${params}`,
    {
      headers: { 'User-Agent': '119-helper-worker/1.0' }
    }
  );
  if (!res.ok) throw new Error(`Shelter API ${res.status}`);
  const json: any = await res.json();
  const items = json?.response?.body?.items || [];

  return { data: items, cacheTtl: 86400 }; // 24시간 캐시
}
