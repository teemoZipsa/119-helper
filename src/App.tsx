import { useState, useEffect } from 'react';
import './index.css';
import StickyNotes from './components/StickyNotes';
import Calculators from './components/Calculators';
import FacilityList from './components/FacilityList';
import Calendar from './components/Calendar';
import WeatherDashboard from './components/WeatherDashboard';
import ERDashboard from './components/ERDashboard';
import DashboardView from './components/DashboardView';
import BuildingView from './components/BuildingView';
import GlobalSearch from './components/GlobalSearch';
import { MOCK_HYDRANTS, MOCK_WATER_TOWERS } from './data/mockData';

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

const cityNames: Record<string, string> = {
  seoul: '서울', busan: '부산', daegu: '대구', incheon: '인천',
  gwangju: '광주', daejeon: '대전', ulsan: '울산', sejong: '세종', jeju: '제주',
};

/* ─────────── Main App ─────────── */
export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [city, setCity] = useState<string>(() => localStorage.getItem('119helper-city') || 'seoul');
  const [gpsStatus, setGpsStatus] = useState<'loading' | 'granted' | 'denied' | 'idle'>('idle');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // GPS 자동 감지
  useEffect(() => {
    if (!navigator.geolocation) return;
    const saved = localStorage.getItem('119helper-city');
    if (saved) return;

    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
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

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    localStorage.setItem('119helper-city', newCity);
  };

  const handleNavigate = (tab: TabId) => {
    setActiveTab(tab);
    setSidebarOpen(false); // 모바일에서 탭 변경 시 사이드바 닫기
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView onNavigate={handleNavigate} city={city} />;
      case 'weather': return <WeatherDashboard city={city} />;
      case 'hydrants': return <FacilityList data={MOCK_HYDRANTS} title="소화전 위치" icon="🚒" typeLabel="소화전" city={city} />;
      case 'waterTowers': return <FacilityList data={MOCK_WATER_TOWERS} title="급수탑 · 저수조 위치" icon="💧" typeLabel="급수탑/저수조/비상소화장치" city={city} />;
      case 'er': return <ERDashboard city={city} />;
      case 'building': return <BuildingView />;
      case 'calculator': return <Calculators />;
      case 'calendar': return <Calendar />;
      case 'memo': return <StickyNotes />;
      default: return <DashboardView onNavigate={handleNavigate} city={city} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-surface-container-lowest flex flex-col shrink-0 border-r border-outline-variant/20
        transform transition-transform duration-200 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
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
              onClick={() => handleNavigate(item.id)}
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
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-surface-container-lowest flex items-center justify-between px-4 md:px-6 border-b border-outline-variant/20 shrink-0 gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-surface-container transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl">menu</span>
            </button>

            <h2 className="text-sm font-bold text-on-surface font-headline capitalize shrink-0 hidden sm:block">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label || '대시보드'}
            </h2>

            {/* Search */}
            <GlobalSearch onNavigate={handleNavigate} />
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
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
              <span className="material-symbols-outlined text-on-surface-variant text-xs hidden sm:inline">expand_more</span>
            </div>
            <button className="relative p-1.5 rounded-lg hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="p-1.5 rounded-lg hover:bg-surface-container transition-colors hidden sm:block">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">settings</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
