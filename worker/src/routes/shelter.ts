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

  // 공공데이터포털 api.data.go.kr 도메인은 HTTPS 통신 시 
  // 존재하지 않는 www.api.data.go.kr 로 301 Redirection 시키는 SSL 서버 구성 오류가 있어
  // HTTP 환경으로 통신하여 520 타임아웃을 우회합니다.
  const res = await fetch(
    `http://api.data.go.kr/openapi/tn_pubr_public_shelter_api?${params}`,
    { headers: { 'User-Agent': '119-helper-worker/1.0' } }
  );
  if (!res.ok) throw new Error(`Shelter API ${res.status}`);
  const json: any = await res.json();
  const items = json?.response?.body?.items || [];

  return { data: items, cacheTtl: 86400 }; // 24시간 캐시 (대피소 위치는 자주 안 변함)
}
