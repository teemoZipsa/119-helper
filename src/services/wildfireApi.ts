import { apiFetch } from './apiClient';

export interface WildfireItem {
  id: string; // FRSTFR_INFO_ID
  address: string; // FRSTFR_DCLR_ADDR
  occurredAt: string; // FRSTFR_GNT_DT (yyyy/mm/dd hh:mm:ss)
  extinguishedAt: string | null; // EXTNGS_CMPTN_DT
  isOngoing: boolean;
  damageArea: number; // GRS_FRSTFR_DAM_AREA
  lat?: number; // FRSTFR_PSTN_YCRD
  lng?: number; // FRSTFR_PSTN_XCRD
}

let cachedWildfires: WildfireItem[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 3 * 60 * 1000; // 3분 캐시

export async function fetchWildfires(numOfRows = '200', pageNo = '1', forceRefresh = false, retryCount = 0): Promise<WildfireItem[]> {
  if (!forceRefresh && cachedWildfires && cachedWildfires.length > 0 && Date.now() - lastFetchTime < CACHE_TTL) {
    return cachedWildfires;
  }

  try {
    const data = await apiFetch<{ body: any[], totalCount?: number }>('/api/wildfire', { numOfRows, pageNo });
    if (!data || !data.body || data.body.length === 0) {
      if (retryCount < 3) {
        console.warn(`산불 데이터 빈 응답. 1초 뒤 재시도... (${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWildfires(numOfRows, pageNo, forceRefresh, retryCount + 1);
      }
      return cachedWildfires || [];
    }

    const items = data.body.map((item: any) => {
      const extinguished = item.EXTNGS_CMPTN_DT || null;
      return {
        id: item.FRSTFR_INFO_ID || Math.random().toString(),
        address: item.FRSTFR_DCLR_ADDR || '위치 미상',
        occurredAt: item.FRSTFR_GNT_DT || '',
        extinguishedAt: extinguished,
        isOngoing: !extinguished, // 진화완료일시가 없으면 진화중으로 판단
        damageArea: item.GRS_FRSTFR_DAM_AREA || 0,
        lat: item.FRSTFR_PSTN_YCRD ? parseFloat(item.FRSTFR_PSTN_YCRD) : undefined,
        lng: item.FRSTFR_PSTN_XCRD ? parseFloat(item.FRSTFR_PSTN_XCRD) : undefined,
      };
    }).sort((a: any, b: any) => b.occurredAt.localeCompare(a.occurredAt)); // 최신순 정렬

    cachedWildfires = items;
    lastFetchTime = Date.now();
    return items;
  } catch (err) {
    console.error('산불 데이터 조회 실패:', err);
    if (retryCount < 3) {
      console.warn(`산불 데이터 조회 재시도 중... (${retryCount + 1}/3)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWildfires(numOfRows, pageNo, forceRefresh, retryCount + 1);
    }
    return cachedWildfires || [];
  }
}
