import { useState, useEffect, useCallback } from 'react';
import { fetchMultiUseFacilities } from '../services/apiClient';

const cityToCtprvn: Record<string, string> = {
  seoul: '서울특별시', busan: '부산광역시', daegu: '대구광역시', incheon: '인천광역시',
  gwangju: '광주광역시', daejeon: '대전광역시', ulsan: '울산광역시', sejong: '세종특별자치시', jeju: '제주특별자치도',
};

const cityShort: Record<string, string> = {
  seoul: '서울', busan: '부산', daegu: '대구', incheon: '인천',
  gwangju: '광주', daejeon: '대전', ulsan: '울산', sejong: '세종', jeju: '제주',
};

// 업종별 아이콘/색상 매핑
const TYPE_MAP: Record<string, { icon: string; color: string }> = {
  '노래연습장': { icon: '🎤', color: 'text-purple-400' },
  '단란주점': { icon: '🍻', color: 'text-amber-400' },
  '유흥주점': { icon: '🎶', color: 'text-pink-400' },
  '비디오감상실': { icon: '🎬', color: 'text-blue-400' },
  '게임제공업': { icon: '🎮', color: 'text-green-400' },
  '인터넷컴퓨터': { icon: '💻', color: 'text-cyan-400' },
  '학원': { icon: '📚', color: 'text-indigo-400' },
  '찜질방': { icon: '♨️', color: 'text-orange-400' },
  '사우나': { icon: '🧖', color: 'text-red-400' },
  '목욕장': { icon: '🛁', color: 'text-teal-400' },
  '골프연습장': { icon: '⛳', color: 'text-green-500' },
  '안마시술소': { icon: '💆', color: 'text-rose-400' },
};

function getTypeInfo(type: string) {
  for (const [key, val] of Object.entries(TYPE_MAP)) {
    if (type.includes(key)) return val;
  }
  return { icon: '🏢', color: 'text-gray-400' };
}

interface MultiUseFacility {
  facilityName: string;
  businessType: string;
  address: string;
  floor?: string;
  area?: string;
  lat?: number;
  lng?: number;
}

interface MultiUseViewProps {
  city: string;
}

export default function MultiUseView({ city }: MultiUseViewProps) {
  const [facilities, setFacilities] = useState<MultiUseFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await fetchMultiUseFacilities(cityToCtprvn[city] || '서울특별시');
      const items = Array.isArray(data) ? data : (data as any)?.items || [];
      setFacilities(items.map((it: any) => ({
        facilityName: it.bplcNm || it.업소명 || it.facilityName || '-',
        businessType: it.induTypeNm || it.업종 || it.businessType || '기타',
        address: it.roadNmAddr || it.sitewhlAddr || it.address || '-',
        floor: it.flrNo || it.floor,
        area: it.totArea || it.area,
      })));
    } catch (e: any) {
      setApiError(e?.message || '다중이용업소 데이터를 불러올 수 없습니다.');
    }
    setLoading(false);
  }, [city]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 업종 목록 추출
  const businessTypes = [...new Set(facilities.map(f => f.businessType))].sort();

  const filtered = facilities.filter(f => {
    const matchSearch = !filter || f.facilityName.includes(filter) || f.address.includes(filter);
    const matchType = typeFilter === 'all' || f.businessType.includes(typeFilter);
    return matchSearch && matchType;
  });

  // 업종별 통계
  const typeStats = businessTypes.map(t => ({
    type: t,
    count: facilities.filter(f => f.businessType === t).length,
    ...getTypeInfo(t),
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-on-surface font-headline">🏢 다중이용업소 조회</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            소방청 다중이용업소 정보 서비스 · <span className="text-primary font-bold">{cityShort[city] || city}</span>
            {!loading && !apiError && <span className="ml-2">· 총 {facilities.length}개소</span>}
          </p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors flex items-center gap-2 disabled:opacity-50">
          <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>refresh</span>
          새로고침
        </button>
      </div>

      {/* API 에러 */}
      {!loading && apiError && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
          <span className="material-symbols-outlined text-5xl text-red-400/60 mb-3 block">cloud_off</span>
          <h3 className="text-lg font-bold text-on-surface mb-2">다중이용업소 API 연결 실패</h3>
          <p className="text-sm text-red-300/80 max-w-lg mx-auto mb-1">{apiError}</p>
          <p className="text-xs text-on-surface-variant max-w-lg mx-auto mb-4">
            공공데이터포털에서 API 서비스 신청 후 승인까지 최대 1~2일이 소요됩니다.
          </p>
          <button onClick={fetchData}
            className="bg-red-500/20 text-red-300 px-5 py-2 rounded-lg text-sm font-bold hover:bg-red-500/30 transition-colors inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">refresh</span>
            다시 시도
          </button>
        </div>
      )}

      {/* 업종별 통계 카드 */}
      {!loading && !apiError && typeStats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {typeStats.slice(0, 12).map(t => (
            <button
              key={t.type}
              onClick={() => setTypeFilter(typeFilter === t.type ? 'all' : t.type)}
              className={`bg-surface-container-lowest border rounded-xl p-3 text-left transition-all hover:scale-[1.02] ${
                typeFilter === t.type ? 'border-primary ring-1 ring-primary/30' : 'border-outline-variant/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{t.icon}</span>
                <span className="text-xs text-on-surface-variant truncate flex-1">{t.type}</span>
              </div>
              <p className="text-xl font-extrabold text-on-surface font-headline tabular-nums">{t.count.toLocaleString()}</p>
            </button>
          ))}
        </div>
      )}

      {/* 검색 & 필터 */}
      {!loading && !apiError && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input
              type="text" placeholder="업소명 또는 주소 검색..."
              value={filter} onChange={e => setFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-surface-container border border-outline-variant/20 rounded-lg text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          {typeFilter !== 'all' && (
            <button onClick={() => setTypeFilter('all')}
              className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors inline-flex items-center gap-1.5">
              {typeFilter} <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
          <span className="text-xs text-on-surface-variant">{filtered.length}건</span>
        </div>
      )}

      {/* 결과 목록 */}
      {loading ? (
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-12 flex items-center justify-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          <span className="text-sm text-on-surface-variant">데이터 로딩 중...</span>
        </div>
      ) : !apiError && filtered.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant/10">
                  <th className="text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider px-4 py-3">업소명</th>
                  <th className="text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider px-4 py-3">업종</th>
                  <th className="text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider px-4 py-3 hidden lg:table-cell">주소</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {filtered.slice(0, 100).map((f, i) => {
                  const info = getTypeInfo(f.businessType);
                  return (
                    <tr key={`${f.facilityName}-${i}`} className="hover:bg-surface-container/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-on-surface">{f.facilityName}</p>
                        <p className="text-xs text-on-surface-variant lg:hidden mt-0.5">{f.address}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-surface-container ${info.color}`}>
                          {info.icon} {f.businessType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant hidden lg:table-cell">{f.address}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > 100 && (
            <div className="bg-surface-container px-4 py-2 text-center text-xs text-on-surface-variant">
              검색 결과가 많습니다. 총 {filtered.length}건 중 상위 100건을 표시합니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
