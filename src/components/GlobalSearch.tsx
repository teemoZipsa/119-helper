import { useState, useRef, useEffect, useMemo } from 'react';
import type { NavigateTarget } from '../types/navigation';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tab: NavigateTarget;
  subId?: string;
  color: string;
}

interface GlobalSearchProps {
  onNavigate: (tab: NavigateTarget, subId?: string) => void;
}

const MENU_ITEMS: { keyword: string[]; tab: NavigateTarget; subId?: string; label: string; subtitle: string; icon: string; color: string }[] = [
  { keyword: ['대시보드', 'dashboard', '홈', '메인'], tab: 'dashboard', label: '대시보드', subtitle: '종합 현황 보기', icon: 'dashboard', color: 'text-primary' },
  { keyword: ['날씨', '기상', '온도', '비', '눈', '바람', '습도', 'weather', '풍속', '예보'], tab: 'weather', label: '기상 정보', subtitle: '실시간 날씨·예보·특보', icon: 'cloud', color: 'text-blue-400' },
  { keyword: ['소화전', '수도', 'hydrant', '소방용수'], tab: 'hydrants', label: '소화전', subtitle: '소화전 위치·현황', icon: 'fire_hydrant', color: 'text-red-400' },
  { keyword: ['급수탑', '저수조', '비상소화', 'water', '수원', '탱크'], tab: 'waterTowers', label: '급수탑/저수조', subtitle: '급수탑·저수조·비상소화장치', icon: 'water_pump', color: 'text-cyan-400' },
  { keyword: ['응급', '응급실', '병원', '병상', 'er', '이송'], tab: 'er', label: '응급실 현황', subtitle: '실시간 가용 병상 조회', icon: 'local_hospital', color: 'text-green-400' },
  { keyword: ['건축', '건물', '대장', 'building', '층수', '구조', '면적', '용도'], tab: 'building', label: '건축물대장', subtitle: '주소 입력 → 건물 정보 즉시 조회', icon: 'apartment', color: 'text-purple-400' },
  { keyword: ['달력', '일정', '교대', '근무', 'calendar', '공휴일', '스케줄'], tab: 'calendar', label: '달력/일정', subtitle: '교대 근무·공휴일', icon: 'calendar_month', color: 'text-orange-400' },
  { keyword: ['계산기', '계산', 'calculator', 'calc'], tab: 'calculator', label: '119 계산기', subtitle: '수압·호스·공기호흡기·유해화학·단위변환', icon: 'calculate', color: 'text-amber-400' },
  { keyword: ['수압', '송수압력', '압력', '계산', 'calculator', 'calc'], tab: 'calculator', subId: 'water_pressure_calc', label: '송수압력 계산기', subtitle: '층수 입력 → 필요 송수압력 계산', icon: 'water_drop', color: 'text-blue-400' },
  { keyword: ['호스', '전개', '거리', '계산', 'calculator', 'calc'], tab: 'calculator', subId: 'hose_length_calc', label: '호스 전개 계산기', subtitle: '거리·층수 입력 → 필요 호스 본수 계산', icon: 'straighten', color: 'text-green-400' },
  { keyword: ['공기호흡기', '공기', '타이머', '잔압', '계산', 'calculator', 'calc'], tab: 'calculator', subId: 'air_tank_timer', label: '공기호흡기 타이머', subtitle: '충전 압력 기반 참고 타이머', icon: 'timer', color: 'text-amber-400' },
  { keyword: ['단위', '변환', '계산', 'calculator', 'calc'], tab: 'calculator', subId: 'unit_converter', label: '단위 변환기', subtitle: '압력·길이·온도 단위 변환', icon: 'sync_alt', color: 'text-emerald-400' },
  { keyword: ['유해', '화학', '물질', 'hazmat', '방호', '구역', '계산', 'calculator', 'calc'], tab: 'calculator', subId: 'hazmat_calc', label: '유해화학물질 계산기', subtitle: '초기 방호·이격 거리 계산', icon: 'science', color: 'text-amber-500' },
  { keyword: ['산불', 'wildfire', '화재', '진화'], tab: 'wildfire', label: '산불 현황', subtitle: '실시간 산불 발생·진화 현황', icon: 'local_fire_department', color: 'text-red-500' },
  { keyword: ['타이머', '현장', '출동', '스톱워치', '교대'], tab: 'field-timer', label: '현장 타이머', subtitle: '공기호흡기·교대·출동 시간 기록', icon: 'timer', color: 'text-orange-400' },
  { keyword: ['장비', '점검', '체크리스트', '개인안전장비'], tab: 'checklist', label: '장비점검', subtitle: '개인안전장비 체크리스트', icon: 'check_circle', color: 'text-orange-400' },
  { keyword: ['법률', '방어', '면책', '소송', '진술'], tab: 'law', subId: 'DEFENSE', label: '실전 법률방어', subtitle: '현장 대응 법률 보호 도구', icon: 'gavel', color: 'text-rose-500' },
  { keyword: ['대응', '매뉴얼', 'manual', '지침', '표준'], tab: 'manual', label: '대응 매뉴얼', subtitle: '표준작전절차(SOP) 및 지침', icon: 'book', color: 'text-indigo-400' },
  { keyword: ['정책', '지침', '법안', 'policy', '소방청'], tab: 'policy', label: '정책/지침', subtitle: '최신 소방 정책 및 법안', icon: 'gavel', color: 'text-blue-500' },
  { keyword: ['뉴스', 'news', '언론', '보도'], tab: 'news', label: '소방 뉴스', subtitle: '소방 관련 최신 언론 보도', icon: 'newspaper', color: 'text-teal-500' },
  { keyword: ['연간', '화재', '통계', 'annual'], tab: 'annual-fire', label: '연간 화재통계', subtitle: '연도별 화재 발생 현황 분석', icon: 'bar_chart', color: 'text-cyan-500' },
  { keyword: ['화재', '분석', 'analysis', '피해'], tab: 'fire-analysis', label: '화재 분석', subtitle: '지역별/원인별 심층 분석', icon: 'insights', color: 'text-purple-500' },
  { keyword: ['지역', '화재', '피해', 'damage'], tab: 'fire-damage', label: '지역별 화재피해', subtitle: '시도별 화재 피해 규모', icon: 'map', color: 'text-red-400' },
  { keyword: ['위험물', '시설', 'hazmat', '제조소', '저장소', '취급소'], tab: 'hazmat', label: '위험물시설', subtitle: '관내 위험물 제조소등 현황', icon: 'warning', color: 'text-orange-500' },
  { keyword: ['생활', '위해', '사고', 'consumer', 'hazards', '안전사고'], tab: 'hazards', label: '생활위해사고', subtitle: '생활 안전사고 통계 및 분석', icon: 'health_and_safety', color: 'text-pink-500' },
  { keyword: ['다중', '이용', '업소', 'multiuse', '안전'], tab: 'multiuse', label: '다중이용업소', subtitle: '다중이용업소 안전관리 현황', icon: 'storefront', color: 'text-green-500' },
];

export default function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // 단축키 '/' 포커스
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '/') return;

      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (isTyping) return;

      e.preventDefault();
      inputRef.current?.focus();
      setIsOpen(true);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // 통합 검색 (메뉴 바로가기 + 기능 키워드)
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    const out: SearchResult[] = [];

    MENU_ITEMS.forEach(m => {
      if (m.keyword.some(k => k.includes(q) || q.includes(k)) || m.label.toLowerCase().includes(q)) {
        out.push({
          id: `menu-${m.tab}-${m.subId || 'main'}`,
          title: m.label,
          subtitle: m.subtitle,
          icon: m.icon,
          tab: m.tab,
          subId: m.subId,
          color: m.color,
        });
      }
    });

    return out.slice(0, 8);
  }, [query]);

  useEffect(() => {
    setSelectedIdx(prev => {
      if (results.length === 0) return 0;
      return Math.min(prev, results.length - 1);
    });
  }, [results.length]);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length === 0) return;
      setSelectedIdx(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length === 0) return;
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
    onNavigate(result.tab, result.subId);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-80 ml-4 hidden md:block">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
      <input
        ref={inputRef}
        className="w-full pl-9 pr-4 py-2 bg-surface-container border-none rounded-full text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/30 focus:outline-none"
        placeholder="메뉴 바로가기 검색 (예: 날씨, 산불, 계산기)..."
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
              type="button"
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
