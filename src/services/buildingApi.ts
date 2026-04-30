// 건축물대장 API — Cloudflare Worker 프록시 경유

import { fetchBuildingInfo, isStaleDataError, StaleDataError } from './apiClient';

export interface BuildingRegisterInfo {
  bldNm?: string;
  strctCdNm?: string;
  grndFlrCnt?: number;
  ugrndFlrCnt?: number;
  mainPurpsCdNm?: string;
  totArea?: number;
  useAprDay?: string;
  bcRat?: number;
  vlRat?: number;
  archArea?: number;
  platArea?: number;
}

function parseBuildingItem(items: any[]): BuildingRegisterInfo | null {
  if (!items || items.length === 0) return null;

  const item = items[0];
  return {
    bldNm: item.bldNm || '',
    strctCdNm: item.strctCdNm || '',
    grndFlrCnt: parseInt(item.grndFlrCnt) || 0,
    ugrndFlrCnt: parseInt(item.ugrndFlrCnt) || 0,
    mainPurpsCdNm: item.mainPurpsCdNm || '',
    totArea: parseFloat(item.totArea) || 0,
    useAprDay: item.useAprDay || '',
    bcRat: parseFloat(item.bcRat) || 0,
    vlRat: parseFloat(item.vlRat) || 0,
    archArea: parseFloat(item.archArea) || 0,
    platArea: parseFloat(item.platArea) || 0,
  };
}

export async function fetchBuildingRegister(
  sigunguCd: string,
  bjdongCd: string,
  platGbCd: string,
  bun: string,
  ji: string,
  forceRefresh?: boolean
): Promise<BuildingRegisterInfo | null> {
  let items: any[] | undefined;
  try {
    items = await fetchBuildingInfo({ sigunguCd, bjdongCd, platGbCd, bun, ji }, forceRefresh) as any[];
  } catch (e: any) {
    if (isStaleDataError(e)) {
      const mapped = parseBuildingItem(e.cachedData);
      if (mapped) throw new StaleDataError(mapped, e.message, e.cachedAt);
    }
    console.error('건축물대장 조회 실패:', e);
    return null;
  }
  
  return parseBuildingItem(items);
}
