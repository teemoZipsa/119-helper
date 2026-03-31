import { useState, useEffect } from 'react';
import './index.css';
import StickyNotes from './components/StickyNotes';
import Calculators from './components/Calculators';
import FacilityList from './components/FacilityList';
import Calendar from './components/Calendar';
import WeatherDashboard from './components/WeatherDashboard';
import ERDashboard from './components/ERDashboard';
import { MOCK_HYDRANTS, MOCK_WATER_TOWERS, MOCK_WEATHER, MOCK_ER_DATA } from './data/mockData';

type TabId = 'dashboard' | 'hydrants' | 'waterTowers' | 'er' | 'building' | 'weather' | 'calculator' | 'memo' | 'calendar';

interface NavItem {
  id: TabId;
  icon: string;
  label: string;
  filled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', icon: 'dashboard', label: '대시보드', filled: true },
  { id: 'weather', icon: 'cloud', label: '기상 정보' },
  { id: 'hydrants', icon: 'fire_hydrant', label: '소화전' },
  { id: 'waterTowers', icon: 'water_pump', label: '급수탑/저수조' },
  { id: 'er', icon: 'local_hospital', label: '응급실 현황' },
  { id: 'building', icon: 'apartment', label: '건축물대장' },
  { id: 'calculator', icon: 'calculate', label: '계산기' },
  { id: 'calendar', icon: 'calendar_month', label: '달력/일정' },
  { id: 'memo', icon: 'sticky_note_2', label: '메모장' },
];

/* ─────────── Dashboard View ─────────── */
function DashboardView({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const w = MOCK_WEATHER;
  return (
    <div className="space-y-6">
      {/* Weather Alert Banner */}
      {w.alerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-900/40 to-orange-900/30 border border-red-500/30 rounded-xl p-4 flex items-center gap-4 animate-pulse">
          <span className="material-symbols-outlined text-red-400 text-3xl">warning</span>
          <div className="flex-1">
            <p className="text-red-300 font-bold text-sm">⚠️ 기상특보 발효 중</p>
            <p className="text-red-200/80 text-xs mt-0.5">
              {w.alerts.map(a => `${a.type} — ${a.region} (${a.issued})`).join(' | ')}
            </p>
          </div>
          <button onClick={() => onNavigate('weather')} className="text-xs bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors">
            상세보기
          </button>
        </div>
      )}

      {/* Large Weather + ER Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* BIG Weather Widget */}
        <div className="col-span-7 bg-gradient-to-br from-blue-900/30 via-indigo-900/20 to-purple-900/20 border border-blue-500/10 rounded-xl p-8 relative overflow-hidden cursor-pointer hover:border-blue-500/30 transition-colors" onClick={() => onNavigate('weather')}>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-300/60">현재 날씨</p>
              <h3 className="text-7xl font-extrabold text-on-surface mt-2 font-headline">
                {w.temperature}<span className="text-3xl text-on-surface-variant ml-1">°C</span>
              </h3>
              <p className="text-lg text-on-surface-variant mt-1">{w.sky}</p>
            </div>
            <div className="text-right space-y-3">
              <div className="bg-surface-container/60 backdrop-blur-sm rounded-lg px-4 py-2.5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">풍속 / 풍향</p>
                <p className="text-lg font-bold text-on-surface">{w.windSpeed}m/s <span className="text-on-surface-variant">{w.windDirection}</span></p>
              </div>
              <div className="bg-surface-container/60 backdrop-blur-sm rounded-lg px-4 py-2.5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">습도</p>
                <p className="text-lg font-bold text-on-surface">{w.humidity}%</p>
              </div>
            </div>
          </div>
          <div className="flex gap-6 mt-6 relative z-10">
            <div className="flex items-center gap-2 bg-surface-container/40 rounded-lg px-3 py-2">
              <span className="text-xs text-on-surface-variant">미세먼지</span>
              <span className={`text-xs font-bold ${w.pm10 <= 30 ? 'text-green-400' : w.pm10 <= 80 ? 'text-yellow-400' : 'text-red-400'}`}>{w.pm10}㎍/㎥</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container/40 rounded-lg px-3 py-2">
              <span className="text-xs text-on-surface-variant">초미세먼지</span>
              <span className={`text-xs font-bold ${w.pm25 <= 15 ? 'text-green-400' : w.pm25 <= 35 ? 'text-yellow-400' : 'text-red-400'}`}>{w.pm25}㎍/㎥</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container/40 rounded-lg px-3 py-2">
              <span className="text-xs text-on-surface-variant">강수량</span>
              <span className="text-xs font-bold text-on-surface">{w.precipitation}mm</span>
            </div>
          </div>
        </div>

        {/* ER Summary */}
        <div className="col-span-5 flex flex-col gap-6">
          <div className="flex-1 bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onNavigate('er')}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">응급실 가용 병상</p>
                <h4 className="text-4xl font-extrabold mt-1 font-headline">
                  <span className="text-secondary">{MOCK_ER_DATA.reduce((s, e) => s + e.available, 0)}</span>
                  <span className="text-lg text-on-surface-variant ml-1">/ {MOCK_ER_DATA.reduce((s, e) => s + e.total, 0)}</span>
                </h4>
              </div>
              <div className="p-2 bg-secondary/10 rounded-lg">
                <span className="material-symbols-outlined text-secondary text-2xl">emergency</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-3">반경 10km 내 {MOCK_ER_DATA.length}개 병원 기준</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              {MOCK_ER_DATA.slice(0, 3).map(er => (
                <span key={er.name} className={`text-[10px] px-2 py-1 rounded-full border ${er.available > 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {er.name.replace(/병원|대학교|서울/g, '').trim()} {er.available}석
                </span>
              ))}
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onNavigate('hydrants')} className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-4 text-left hover:border-primary/30 transition-colors group">
              <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">fire_hydrant</span>
              <p className="text-2xl font-extrabold text-on-surface mt-1 font-headline">{MOCK_HYDRANTS.length}</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">소화전</p>
            </button>
            <button onClick={() => onNavigate('waterTowers')} className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-4 text-left hover:border-primary/30 transition-colors group">
              <span className="material-symbols-outlined text-secondary text-xl group-hover:scale-110 transition-transform">water_pump</span>
              <p className="text-2xl font-extrabold text-on-surface mt-1 font-headline">{MOCK_WATER_TOWERS.length}</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">급수탑/저수조</p>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Tools */}
      <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10">
          <h3 className="text-lg font-extrabold text-on-surface font-headline">🛠️ 빠른 도구</h3>
        </div>
        <div className="grid grid-cols-5 gap-4 p-6">
          {[
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

/* ─────────── Weather View → WeatherDashboard 컴포넌트로 대체 ─────────── */

/* ─────────── ER Detail View ─────────── */
// ERView는 ERDashboard 컴포넌트로 대체됨

/* ─────────── Building Search View ─────────── */
function BuildingView() {
  const [address, setAddress] = useState('');
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-on-surface font-headline">🏛️ 건축물대장 검색</h2>
      <p className="text-sm text-on-surface-variant">주소를 입력하면 건물 정보를 조회합니다 (API 연동 예정)</p>
      <div className="flex gap-3">
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="예: 서울특별시 종로구 세종대로 209"
          className="flex-1 bg-surface-container border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold hover:bg-primary/80 transition-colors">
          검색
        </button>
      </div>
      {address && (
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 space-y-4">
          <p className="text-on-surface-variant text-sm italic">API 키 연동 후 실제 건축물대장 데이터가 여기에 표시됩니다.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '건물명', value: '(API 연동 필요)' },
              { label: '구조', value: '–' },
              { label: '층수', value: '–' },
              { label: '용도', value: '–' },
              { label: '연면적', value: '–' },
              { label: '준공일', value: '–' },
            ].map(item => (
              <div key={item.label} className="bg-surface-container rounded-lg p-3">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-bold text-on-surface mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── Main App ─────────── */
export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [city, setCity] = useState<string>(() => localStorage.getItem('119helper-city') || 'seoul');
  const [gpsStatus, setGpsStatus] = useState<'loading' | 'granted' | 'denied' | 'idle'>('idle');

  // GPS 자동 감지
  useEffect(() => {
    if (!navigator.geolocation) return;
    const saved = localStorage.getItem('119helper-city');
    if (saved) return; // 이미 수동 설정했으면 GPS 안 씀

    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // 가장 가까운 도시 찾기 (간단한 거리 계산)
        const cityCoords: Record<string, [number, number]> = {
          seoul: [37.5665, 126.978], busan: [35.1796, 129.0756],
          daegu: [35.8714, 128.6014], incheon: [37.4563, 126.7052],
          gwangju: [35.1595, 126.8526], daejeon: [36.3504, 127.3845],
          ulsan: [35.5384, 129.3114], sejong: [36.48, 127.0],
          jeju: [33.4996, 126.5312],
        };
        let closest = 'seoul', minDist = Infinity;
        Object.entries(cityCoords).forEach(([key, [lat, lng]]) => {
          const dist = Math.sqrt((latitude - lat) ** 2 + (longitude - lng) ** 2);
          if (dist < minDist) { minDist = dist; closest = key; }
        });
        setCity(closest);
        setGpsStatus('granted');
      },
      () => setGpsStatus('denied'),
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, []);

  // 도시 변경 시 저장
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    localStorage.setItem('119helper-city', newCity);
  };

  const cityNames: Record<string, string> = {
    seoul: '서울', busan: '부산', daegu: '대구', incheon: '인천',
    gwangju: '광주', daejeon: '대전', ulsan: '울산', sejong: '세종', jeju: '제주',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView onNavigate={setActiveTab} />;
      case 'weather': return <WeatherDashboard city={city} />;
      case 'hydrants': return <FacilityList data={MOCK_HYDRANTS} title="소화전 위치" icon="🚒" typeLabel="소화전" />;
      case 'waterTowers': return <FacilityList data={MOCK_WATER_TOWERS} title="급수탑 · 저수조 위치" icon="💧" typeLabel="급수탑/저수조/비상소화장치" />;
      case 'er': return <ERDashboard city={city} />;
      case 'building': return <BuildingView />;
      case 'calculator': return <Calculators />;
      case 'calendar': return <Calendar />;
      case 'memo': return <StickyNotes />;
      default: return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-lowest flex flex-col shrink-0 border-r border-outline-variant/20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-on-surface font-headline">119 Helper</h1>
          </div>
          <p className="text-xs text-on-surface-variant font-medium">소방관 도우미</p>
        </div>
        <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                activeTab === item.id
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                  : 'text-on-surface-variant hover:bg-surface-container-high/50'
              }`}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={activeTab === item.id ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-outline-variant/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">person</span>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">소방관</p>
            <p className="text-[10px] text-on-surface-variant">사용자</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-surface-container-lowest flex items-center justify-between px-6 border-b border-outline-variant/20 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-sm font-bold text-on-surface font-headline capitalize">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label || '대시보드'}
            </h2>
            <div className="relative w-80 ml-4">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
              <input
                className="w-full pl-9 pr-4 py-2 bg-surface-container border-none rounded-full text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/30 focus:outline-none"
                placeholder="주소, 건물명, 응급실 검색..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* 📍 Global Location Selector */}
            <div className="flex items-center gap-1.5 bg-surface-container rounded-full px-3 py-1.5">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                {gpsStatus === 'granted' ? 'my_location' : 'location_on'}
              </span>
              <select
                value={city}
                onChange={e => handleCityChange(e.target.value)}
                className="bg-transparent text-on-surface text-sm font-bold focus:outline-none cursor-pointer pr-1 appearance-none"
                style={{ WebkitAppearance: 'none' }}
              >
                {Object.entries(cityNames).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <span className="material-symbols-outlined text-on-surface-variant text-xs">expand_more</span>
            </div>
            <button className="relative p-1.5 rounded-lg hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="p-1.5 rounded-lg hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">settings</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
