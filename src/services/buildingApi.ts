const API_KEY = import.meta.env.VITE_BUILDING_API_KEY;

export interface BuildingRegisterInfo {
  bldNm?: string;          // 건물명
  strctCdNm?: string;      // 구조
  grndFlrCnt?: number;     // 지상층수
  ugrndFlrCnt?: number;    // 지하층수
  mainPurpsCdNm?: string;  // 주용도
  totArea?: number;        // 연면적 (㎡)
  useAprDay?: string;      // 사용승인일 (준공일)
  bcRat?: number;          // 건폐율 (%)
  vlRat?: number;          // 용적률 (%)
  archArea?: number;       // 건축면적 (㎡)
  platArea?: number;       // 대지면적 (㎡)
}

export async function fetchBuildingRegister(
  sigunguCd: string,
  bjdongCd: string,
  platGbCd: string,
  bun: string,
  ji: string
): Promise<BuildingRegisterInfo | null> {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    sigunguCd,
    bjdongCd,
    platGbCd,
    bun: bun.padStart(4, '0'),
    ji: ji.padStart(4, '0'),
    numOfRows: '10',
    pageNo: '1',
    _type: 'json'
  });

  const targetUrl = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?${params.toString()}`;

  try {
    // 1순위: 직접 호출 시도 (최근 data.go.kr 단에서 CORS 점차 허용 중)
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error('Direct fetch failed');
    const data = await res.json();
    
    // 에러나 빈 결과 처리
    const items = data?.response?.body?.items?.item;
    if (!items) return null;

    // 만약 리스트 형태로 오면 최우선(첫번째) 데이터 또는 주건축물 선택
    const mainBuilding = Array.isArray(items) ? items[0] : items;

    return {
      bldNm: mainBuilding.bldNm || '',
      strctCdNm: mainBuilding.strctCdNm || '',
      grndFlrCnt: Number(mainBuilding.grndFlrCnt) || 0,
      ugrndFlrCnt: Number(mainBuilding.ugrndFlrCnt) || 0,
      mainPurpsCdNm: mainBuilding.mainPurpsCdNm || '',
      totArea: Number(mainBuilding.totArea) || 0,
      useAprDay: mainBuilding.useAprDay || '',
      bcRat: Number(mainBuilding.bcRat) || 0,
      vlRat: Number(mainBuilding.vlRat) || 0,
      archArea: Number(mainBuilding.archArea) || 0,
      platArea: Number(mainBuilding.platArea) || 0,
    };

  } catch (err) {
    console.warn('직접 호출 실패, 프록시(allorigins) 경유 시도:', err);
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      const pRes = await fetch(proxyUrl);
      const pData = await pRes.json();
      
      const pItems = pData?.response?.body?.items?.item;
      if (!pItems) return null;

      const mainBuilding = Array.isArray(pItems) ? pItems[0] : pItems;

      return {
        bldNm: mainBuilding.bldNm || '',
        strctCdNm: mainBuilding.strctCdNm || '',
        grndFlrCnt: Number(mainBuilding.grndFlrCnt) || 0,
        ugrndFlrCnt: Number(mainBuilding.ugrndFlrCnt) || 0,
        mainPurpsCdNm: mainBuilding.mainPurpsCdNm || '',
        totArea: Number(mainBuilding.totArea) || 0,
        useAprDay: mainBuilding.useAprDay || '',
        bcRat: Number(mainBuilding.bcRat) || 0,
        vlRat: Number(mainBuilding.vlRat) || 0,
        archArea: Number(mainBuilding.archArea) || 0,
        platArea: Number(mainBuilding.platArea) || 0,
      };
    } catch (e2) {
      console.error('건축물대장 API 로드 실패', e2);
      return null;
    }
  }
}
