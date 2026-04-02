import { useState, useEffect } from 'react';
import { getRealtimeAirQuality, type AirQualityData } from '../services/airQualityApi';
import { getERRealTimeBeds, CITY_TO_SIDO, type ERRealTimeData } from '../services/erApi';
import { getUltraShortNow, parseCurrentWeather, CITY_GRIDS, type CurrentWeather } from '../services/weatherApi';
import type { FireFacility } from '../data/mockData';
import { fetchAnnualFireStats } from '../services/apiClient';
import type { AnnualFireStatsResponse } from '../services/apiClient';

type TabId = 'dashboard' | 'hydrants' | 'waterTowers' | 'er' | 'building' | 'weather' | 'calculator' | 'memo' | 'calendar' | 'emergency' | 'fire-analysis' | 'annual-fire';

const cityNames: Record<string, string> = {
  seoul: '서울', busan: '부산', daegu: '대구', incheon: '인천',
  gwangju: '광주', daejeon: '대전', ulsan: '울산', sejong: '세종', jeju: '제주',
};

interface DashboardProps {
  onNavigate: (tab: TabId) => void;
  city: string;
  fireFacilities: FireFacility[];
  isLoadingFacilities: boolean;
}

export default function DashboardView({ onNavigate, city, fireFacilities, isLoadingFacilities }: DashboardProps) {
  const cityLabel = cityNames[city] || '서울';
  
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [erList, setErList] = useState<ERRealTimeData[]>([]);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [fireStats, setFireStats] = useState<AnnualFireStatsResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 실시간 날씨
    const grid = CITY_GRIDS[city] || CITY_GRIDS.seoul;
    setWeatherLoading(true);
    getUltraShortNow(grid.nx, grid.ny).then(items => {
      if (isMounted && items.length > 0) {
        setWeather(parseCurrentWeather(items));
      }
      setWeatherLoading(false);
    }).catch(() => setWeatherLoading(false));

    // 대기질
    getRealtimeAirQuality(city).then(data => {
      if (isMounted && data) setAirQuality(data);
    });
    
    // 응급실
    const sido = CITY_TO_SIDO[city] || '서울특별시';
    getERRealTimeBeds(sido).then(data => {
      if (isMounted && data) setErList(data);
    });
    return () => { isMounted = false; };
  }, [city]);

  // 연간화재통계 (한번만 로드)
  useEffect(() => {
    fetchAnnualFireStats('2024').then(setFireStats).catch(() => {});
  }, []);

  const hydrantsCount = fireFacilities.filter(f => f.type === '소화전').length;
  const towersCount = fireFacilities.filter(f => f.type !== '소화전').length;

  return (
    <div className="space-y-6">
      {/* Weather Alert Banner — 습도 30% 이하 or 풍속 10m/s 이상 시 자동 경고 */}
      {weather && (weather.humidity <= 30 || weather.windSpeed >= 10) && (
        <div className="bg-gradient-to-r from-red-900/40 to-orange-900/30 border border-red-500/30 rounded-xl p-4 flex items-center gap-4">
          <span className="material-symbols-outlined text-red-400 text-3xl">warning</span>
          <div className="flex-1">
            <p className="text-red-300 font-bold text-sm">⚠️ 현장 활동 주의</p>
            <p className="text-red-200/80 text-xs mt-0.5">
              {weather.humidity <= 30 ? `건조 주의 — 습도 ${weather.humidity}% ` : ''}
              {weather.windSpeed >= 10 ? `강풍 주의 — 풍속 ${weather.windSpeed}m/s` : ''}
              ({cityLabel} 기준, {weather.lastUpdate} 갱신)
            </p>
          </div>
          <button onClick={() => onNavigate('weather')} className="text-xs bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors">
            상세보기
          </button>
        </div>
      )}

      {/* Large Weather + ER Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* BIG Weather Widget */}
        <div className="lg:col-span-7 bg-gradient-to-br from-blue-900/30 via-indigo-900/20 to-purple-900/20 border border-blue-500/10 rounded-xl p-5 md:p-8 relative overflow-hidden cursor-pointer hover:border-blue-500/30 transition-colors" onClick={() => onNavigate('weather')}>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-300/60">현재 날씨</p>
                <span className="text-[10px] bg-surface-container/50 px-2 py-0.5 rounded text-on-surface-variant">{cityLabel}</span>
                {weather && <span className="text-[10px] text-on-surface-variant/50">{weather.lastUpdate} 기준</span>}
              </div>
              <h3 className="text-4xl md:text-7xl font-extrabold text-on-surface mt-2 font-headline">
                {weatherLoading ? (
                  <span className="text-2xl animate-pulse text-on-surface-variant">조회 중...</span>
                ) : (
                  <>{weather?.temperature ?? '--'}<span className="text-3xl text-on-surface-variant ml-1">°C</span></>
                )}
              </h3>
              <p className="text-lg text-on-surface-variant mt-1">
                {weather ? `${weather.skyIcon} ${weather.sky}` : '--'}
                {weather?.precipType !== '없음' && weather?.precipIcon && ` ${weather.precipIcon} ${weather.precipType}`}
              </p>
            </div>
            <div className="text-right space-y-3 hidden md:block">
              <div className="bg-surface-container/60 backdrop-blur-sm rounded-lg px-4 py-2.5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">풍속 / 풍향</p>
                <p className="text-lg font-bold text-on-surface">{weather?.windSpeed ?? '--'}m/s <span className="text-on-surface-variant">{weather?.windDirection ?? '--'}</span></p>
              </div>
              <div className="bg-surface-container/60 backdrop-blur-sm rounded-lg px-4 py-2.5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">습도</p>
                <p className={`text-lg font-bold ${weather && weather.humidity <= 30 ? 'text-red-400' : 'text-on-surface'}`}>{weather?.humidity ?? '--'}%</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 md:gap-6 mt-4 md:mt-6 relative z-10 flex-wrap">
            <div className="flex items-center gap-2 bg-surface-container/40 rounded-lg px-3 py-2">
              <span className="text-xs text-on-surface-variant">미세먼지</span>
              <span className={`text-xs font-bold ${
                airQuality?.pm10Grade === '1' ? 'text-blue-400' :
                airQuality?.pm10Grade === '2' ? 'text-green-400' :
                airQuality?.pm10Grade === '3' ? 'text-amber-400' :
                airQuality?.pm10Grade === '4' ? 'text-red-400' : 'text-on-surface-variant'
              }`}>{airQuality ? airQuality.pm10Value : '조회 중'}{airQuality?.pm10Value !== '-' ? '㎍/㎥' : ''}</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container/40 rounded-lg px-3 py-2">
              <span className="text-xs text-on-surface-variant">초미세먼지</span>
              <span className={`text-xs font-bold ${
                airQuality?.pm25Grade === '1' ? 'text-blue-400' :
                airQuality?.pm25Grade === '2' ? 'text-green-400' :
                airQuality?.pm25Grade === '3' ? 'text-amber-400' :
                airQuality?.pm25Grade === '4' ? 'text-red-400' : 'text-on-surface-variant'
              }`}>{airQuality ? airQuality.pm25Value : '조회 중'}{airQuality?.pm25Value !== '-' ? '㎍/㎥' : ''}</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container/40 rounded-lg px-3 py-2">
              <span className="text-xs text-on-surface-variant">강수</span>
              <span className="text-xs font-bold text-on-surface">{weather?.precipitation ?? '--'}mm</span>
            </div>
          </div>
        </div>

        {/* ER Summary */}
        <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
          <div className="flex-1 bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onNavigate('er')}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">응급실 가용 병상</p>
                  <span className="text-[10px] bg-surface-container/50 px-2 py-0.5 rounded text-on-surface-variant">{cityLabel}</span>
                </div>
                <h4 className="text-4xl font-extrabold mt-1 font-headline">
                  <span className="text-secondary">{erList.length > 0 ? erList.reduce((s, e) => s + (parseInt(e.hvec) || 0), 0) : '...'}</span>
                  <span className="text-lg text-on-surface-variant ml-1">/ {erList.length > 0 ? erList.reduce((s, e) => s + (parseInt(e.hpbdn) || 0), 0) : '...'}</span>
                </h4>
              </div>
              <div className="p-2 bg-secondary/10 rounded-lg">
                <span className="material-symbols-outlined text-secondary text-2xl">emergency</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-3">{cityLabel} 관내 {erList.length > 0 ? erList.length : '...'}개 병원 기준</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              {erList.slice(0, 3).map(er => {
                const available = parseInt(er.hvec) || 0;
                return (
                  <span 
                    key={er.dutyName} 
                    title={available < 0 ? "대기 중인 환자 수" : "잔여 병상 수"}
                    className={`text-[10px] px-2 py-1 rounded-full border cursor-help ${available > 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                  >
                    {er.dutyName.replace(/병원|대학교|서울/g, '').trim()} 
                    {available < 0 ? ` 대기 ${Math.abs(available)}석` : ` 잔여 ${available}석`}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onNavigate('hydrants')} className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-4 text-left hover:border-primary/30 transition-colors group relative overflow-hidden">
              <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">fire_hydrant</span>
              <p className="text-2xl font-extrabold text-on-surface mt-1 font-headline">
                {isLoadingFacilities ? <span className="text-sm font-medium animate-pulse text-on-surface-variant">불러오는 중...</span> : hydrantsCount}
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">소화전</p>
            </button>
            <button onClick={() => onNavigate('waterTowers')} className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-4 text-left hover:border-primary/30 transition-colors group relative overflow-hidden">
              <span className="material-symbols-outlined text-secondary text-xl group-hover:scale-110 transition-transform">water_pump</span>
              <p className="text-2xl font-extrabold text-on-surface mt-1 font-headline">
                {isLoadingFacilities ? <span className="text-sm font-medium animate-pulse text-on-surface-variant">불러오는 중...</span> : towersCount}
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">급수탑/저수조</p>
            </button>
            <button onClick={() => onNavigate('emergency')} className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-4 text-left hover:border-red-500/30 transition-colors group relative overflow-hidden col-span-2">
              <span className="material-symbols-outlined text-red-400 text-xl group-hover:scale-110 transition-transform">ambulance</span>
              <p className="text-lg font-extrabold text-on-surface mt-1 font-headline">구급 출동 분석</p>
              <p className="text-[10px] text-on-surface-variant">전국 구급통계 · 출동유형 · 연령별 분석</p>
            </button>
            <button onClick={() => onNavigate('fire-analysis')} className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-4 text-left hover:border-orange-500/30 transition-colors group relative overflow-hidden col-span-2">
              <span className="material-symbols-outlined text-orange-400 text-xl group-hover:scale-110 transition-transform">local_fire_department</span>
              <p className="text-lg font-extrabold text-on-surface mt-1 font-headline">화재 분석</p>
              <p className="text-[10px] text-on-surface-variant">발화요인 · 화재장소 · 인명피해 · 재산피해</p>
            </button>
          </div>
        </div>
      </div>

      {/* 연간 화재통계 미니 위젯 */}
      {fireStats && (
        <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden">
          <div className="p-6 pb-0 flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-on-surface font-headline flex items-center gap-2">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              2024년 화재 현황
            </h3>
            <button
              onClick={() => onNavigate('annual-fire' as TabId)}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
            >
              상세 보기
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="p-6 pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: '총 화재', value: fireStats.summary.totalFires.toLocaleString(), icon: 'whatshot', color: 'text-error' },
                { label: '사망', value: `${fireStats.summary.totalDeaths}명`, icon: 'person_off', color: 'text-error' },
                { label: '부상', value: `${fireStats.summary.totalInjuries}명`, icon: 'personal_injury', color: 'text-tertiary' },
                { label: '재산피해', value: fireStats.summary.totalPropertyDamage >= 100_000_000 ? `${(fireStats.summary.totalPropertyDamage / 100_000_000).toFixed(1)}억원` : `${(fireStats.summary.totalPropertyDamage / 10_000).toFixed(0)}만원`, icon: 'payments', color: 'text-primary' },
              ].map(c => (
                <div key={c.label} className="text-center p-3 rounded-xl bg-surface-container">
                  <span className={`material-symbols-outlined ${c.color} text-lg`} style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
                  <p className="text-xl font-extrabold text-on-surface mt-1 font-headline">{c.value}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold">{c.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-2">시도별 화재 TOP 5</p>
              {fireStats.bySido.slice(0, 5).map((item, i) => {
                const max = fireStats.bySido[0]?.count || 1;
                const colors = ['#4f8cff', '#34d399', '#f59e0b', '#ef4444', '#a78bfa'];
                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="text-[10px] text-on-surface-variant w-14 text-right font-medium truncate">{item.name}</span>
                    <div className="flex-1 h-4 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full rounded-full flex items-center justify-end pr-1.5" style={{ width: `${(item.count / max) * 100}%`, backgroundColor: colors[i], minWidth: '1.5rem' }}>
                        <span className="text-[8px] font-bold text-white">{item.count.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Quick Tools */}
      <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10">
          <h3 className="text-lg font-extrabold text-on-surface font-headline">🛠️ 빠른 도구</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 p-4 md:p-6">
          {[
            { icon: 'science', label: '유해물질', tab: 'calculator' as TabId, color: 'text-orange-400' },
            { icon: 'water_drop', label: '수압 계산기', tab: 'calculator' as TabId, color: 'text-blue-400' },
            { icon: 'straighten', label: '호스 전개', tab: 'calculator' as TabId, color: 'text-green-400' },
            { icon: 'timer', label: '공기호흡기', tab: 'calculator' as TabId, color: 'text-amber-400' },
            { icon: 'apartment', label: '건축물대장', tab: 'building' as TabId, color: 'text-purple-400' },
            { icon: 'sticky_note_2', label: '메모장', tab: 'memo' as TabId, color: 'text-pink-400' },
          ].map(tool => (
            <button
              key={tool.label}
              onClick={() => onNavigate(tool.tab)}
              className="flex flex-col items-center gap-3 p-5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all group"
            >
              <span className={`material-symbols-outlined text-3xl ${tool.color} group-hover:scale-110 transition-transform`}>{tool.icon}</span>
              <span className="text-sm font-medium text-on-surface">{tool.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
