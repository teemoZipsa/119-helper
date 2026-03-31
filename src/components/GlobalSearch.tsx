import { useState, useRef, useEffect } from 'react';
import { MOCK_HYDRANTS, MOCK_WATER_TOWERS, MOCK_ER_DATA } from '../data/mockData';

type TabId = 'dashboard' | 'hydrants' | 'waterTowers' | 'er' | 'building' | 'weather' | 'calculator' | 'memo' | 'calendar';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tab: TabId;
  color: string;
}

interface GlobalSearchProps {
  onNavigate: (tab: TabId) => void;
}

export default function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 통합 검색
  const results: SearchResult[] = (() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    const out: SearchResult[] = [];

    // 소화전
    MOCK_HYDRANTS.forEach(h => {
      if (h.address.toLowerCase().includes(q) || h.id.toLowerCase().includes(q) || h.district.includes(q)) {
        out.push({
          id: h.id,
          title: h.id,
          subtitle: `${h.type} · ${h.address}`,
          icon: 'fire_hydrant',
          tab: 'hydrants',
          color: 'text-red-400',
        });
      }
    });

    // 급수탑
    MOCK_WATER_TOWERS.forEach(w => {
      if (w.address.toLowerCase().includes(q) || w.id.toLowerCase().includes(q) || w.district.includes(q)) {
        out.push({
          id: w.id,
          title: w.id,
          subtitle: `${w.type} · ${w.address}`,
          icon: 'water_pump',
          tab: 'waterTowers',
          color: 'text-blue-400',
        });
      }
    });

    // 응급실
    MOCK_ER_DATA.forEach(er => {
      if (er.name.toLowerCase().includes(q) || er.tel.includes(q)) {
        out.push({
          id: er.name,
          title: er.name,
          subtitle: `가용 ${er.available}석 / ${er.total}석 · ${er.tel}`,
          icon: 'local_hospital',
          tab: 'er',
          color: 'text-green-400',
        });
      }
    });

    // 메뉴 항목 (탭 이름 검색)
    const menuMap: { keyword: string[]; tab: TabId; label: string; icon: string }[] = [
      { keyword: ['날씨', '기상', '온도', '비', '눈', 'weather'], tab: 'weather', label: '기상 정보', icon: 'cloud' },
      { keyword: ['계산', '수압', '호스', '공기', 'calc'], tab: 'calculator', label: '소방 계산기', icon: 'calculate' },
      { keyword: ['달력', '일정', '교대', '근무', 'calendar'], tab: 'calendar', label: '달력/일정', icon: 'calendar_month' },
      { keyword: ['메모', '노트', 'memo', 'note'], tab: 'memo', label: '메모장', icon: 'sticky_note_2' },
      { keyword: ['건축', '건물', '대장', 'building'], tab: 'building', label: '건축물대장', icon: 'apartment' },
      { keyword: ['대시보드', 'dashboard', '홈'], tab: 'dashboard', label: '대시보드', icon: 'dashboard' },
    ];
    menuMap.forEach(m => {
      if (m.keyword.some(k => k.includes(q) || q.includes(k))) {
        out.push({
          id: `menu-${m.tab}`,
          title: m.label,
          subtitle: '바로가기',
          icon: m.icon,
          tab: m.tab,
          color: 'text-primary',
        });
      }
    });

    return out.slice(0, 8);
  })();

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      e.preventDefault();
      handleSelect(results[selectedIdx]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleSelect = (result: SearchResult) => {
    onNavigate(result.tab);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-80 ml-4 hidden md:block">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
      <input
        className="w-full pl-9 pr-4 py-2 bg-surface-container border-none rounded-full text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/30 focus:outline-none"
        placeholder="주소, 건물명, 응급실 검색..."
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setIsOpen(true); setSelectedIdx(0); }}
        onFocus={() => query && setIsOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {/* Shortcut hint */}
      {!query && (
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-outline border border-outline-variant/30 rounded px-1.5 py-0.5 font-mono">
          /
        </kbd>
      )}

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-outline-variant/10">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">{results.length}개 결과</span>
          </div>
          {results.map((r, i) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              onMouseEnter={() => setSelectedIdx(i)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                i === selectedIdx ? 'bg-primary/10' : 'hover:bg-surface-container/50'
              }`}
            >
              <span className={`material-symbols-outlined text-lg ${r.color}`}>{r.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{r.title}</p>
                <p className="text-[11px] text-on-surface-variant truncate">{r.subtitle}</p>
              </div>
              {i === selectedIdx && (
                <kbd className="text-[9px] text-outline border border-outline-variant/30 rounded px-1 py-0.5 font-mono shrink-0">↵</kbd>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 p-6 text-center">
          <span className="material-symbols-outlined text-2xl text-outline/40">search_off</span>
          <p className="text-sm text-on-surface-variant mt-1">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}
