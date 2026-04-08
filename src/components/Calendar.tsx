import { useState, useEffect, useMemo } from 'react';
import { getStaticHolidays } from '../data/holidays';

interface Schedule {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: '근무' | '점검' | '교육' | '기타';
  memo: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  '근무': { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
  '점검': { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
  '교육': { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-400' },
  '기타': { bg: 'bg-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-400' },
};

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];


export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    try {
      const saved = localStorage.getItem('119helper-schedules');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<Schedule['type']>('점검');
  const [newMemo, setNewMemo] = useState('');
  const [shiftPattern, setShiftPattern] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('119helper-shift-pattern');
      return saved ? JSON.parse(saved) : ['주간', '야간', '비번', '휴무'];
    } catch { return ['주간', '야간', '비번', '휴무']; }
  });
  const [shiftAnchorDate, setShiftAnchorDate] = useState<string>(() => {
    return localStorage.getItem('119helper-shift-anchor') || '';
  });
  const [shiftPreset, setShiftPreset] = useState<string>(() => {
    return localStorage.getItem('119helper-shift-preset') || '4조 2교대 (주야비휴)';
  });

  useEffect(() => {
    localStorage.setItem('119helper-schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('119helper-shift-pattern', JSON.stringify(shiftPattern));
    localStorage.setItem('119helper-shift-anchor', shiftAnchorDate);
    localStorage.setItem('119helper-shift-preset', shiftPreset);
  }, [shiftPattern, shiftAnchorDate, shiftPreset]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // 오늘 자정 객체 (계산용)
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // 공휴일 데이터 — 정적 데이터에서 즉시 로드 (API 불필요)
  const holidays = useMemo(() => getStaticHolidays(year, month + 1), [year, month]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const dateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getSchedulesForDate = (day: number) =>
    schedules.filter(s => s.date === dateStr(day));

  // Calculate shift for a given date
  const getShift = (day: number): string | null => {
    if (!shiftAnchorDate || shiftPattern.length === 0) return null;
    const anchor = new Date(shiftAnchorDate);
    const target = new Date(year, month, day);
    const diffDays = Math.floor((target.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24));
    let idx = diffDays % shiftPattern.length;
    if (idx < 0) idx += shiftPattern.length;
    return shiftPattern[idx];
  };

  const getTodayShiftIndex = (): number | '' => {
    if (!shiftAnchorDate || shiftPattern.length === 0) return '';
    const anchor = new Date(shiftAnchorDate);
    const diffDays = Math.floor((todayMidnight.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24));
    let idx = diffDays % shiftPattern.length;
    if (idx < 0) idx += shiftPattern.length;
    return idx;
  };

  const shiftColor = (shift: string) => {
    if (shift.includes('주간') || shift.includes('주')) return 'text-amber-400 bg-amber-500/10';
    if (shift.includes('야간') || shift.includes('야')) return 'text-indigo-400 bg-indigo-500/10';
    if (shift.includes('비번') || shift.includes('비')) return 'text-green-500 bg-green-500/10';
    if (shift.includes('휴무') || shift.includes('휴')) return 'text-gray-500 bg-gray-500/10';
    if (shift.includes('당직') || shift.includes('당')) return 'text-red-400 bg-red-500/10';
    return 'text-primary bg-primary/10';
  };

  const addSchedule = () => {
    if (!selectedDate || !newTitle.trim()) return;
    const schedule: Schedule = {
      id: Date.now().toString(),
      date: selectedDate,
      title: newTitle.trim(),
      type: newType,
      memo: newMemo.trim(),
    };
    setSchedules([...schedules, schedule]);
    setNewTitle('');
    setNewMemo('');
    setShowAddModal(false);
  };

  const deleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const selectedSchedules = selectedDate
    ? schedules.filter(s => s.date === selectedDate)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-on-surface font-headline">📅 달력 / 일정</h2>
          <p className="text-sm text-on-surface-variant mt-1">근무·점검·교육 일정 관리</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-outline-variant/10">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
              </button>
              <h3 className="text-xl font-bold text-on-surface font-headline min-w-[140px] text-center">
                {year}년 {month + 1}월
              </h3>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </button>
            </div>
            <button onClick={goToday} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-colors">
              오늘
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-outline-variant/10">
            {DAYS.map((d, i) => (
              <div key={d} className={`py-2 text-center text-xs font-bold uppercase tracking-wider ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-on-surface-variant'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[90px] border-b border-r border-outline-variant/5 bg-surface-container-lowest/50" />
            ))}

            {/* Date cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const ds = dateStr(day);
              const isToday = ds === todayStr;
              const isSelected = ds === selectedDate;
              const daySchedules = getSchedulesForDate(day);
              const dayOfWeek = (firstDay + i) % 7;
              const shift = getShift(day);
              const holidayNames = holidays.get(ds) || [];
              const isHoliday = holidayNames.length > 0;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(ds)}
                  className={`min-h-[90px] p-1.5 text-left border-b border-r border-outline-variant/5 transition-colors relative
                    ${isSelected ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-surface-container/50'}
                    ${isToday ? 'bg-primary/5' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-primary text-on-primary' : isHoliday || dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-blue-400' : 'text-on-surface'}
                    `}>
                      {day}
                    </span>
                    {shift && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${shiftColor(shift)}`}>
                        {shift}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {holidayNames.map((name, hi) => (
                      <div key={`h-${hi}`} className="text-[9px] truncate px-1 py-0.5 rounded bg-red-500/15 text-red-400 font-bold">
                        🎌 {name}
                      </div>
                    ))}
                    {daySchedules.slice(0, 2).map(s => {
                      const tc = TYPE_COLORS[s.type];
                      return (
                        <div key={s.id} className={`text-[9px] truncate px-1 py-0.5 rounded ${tc.bg} ${tc.text} font-medium`}>
                          {s.title}
                        </div>
                      );
                    })}
                    {daySchedules.length > 2 && (
                      <div className="text-[9px] text-on-surface-variant">+{daySchedules.length - 2}건</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Shift Settings Wizard */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5">
            <h4 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">work_history</span>
              나의 근무 설정
            </h4>
            <div className="space-y-3">
              {/* Preset Selector */}
              <div>
                <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">근무 형태</label>
                <select
                  value={shiftPreset}
                  onChange={e => {
                    const preset = e.target.value;
                    setShiftPreset(preset);
                    if (preset === '4조 2교대 (주야비휴)') setShiftPattern(['주간', '야간', '비번', '휴무']);
                    else if (preset === '3조 1교대 (당비비)') setShiftPattern(['당직', '비번', '비번']);
                    else if (preset === '3조 2교대 (당비휴)') setShiftPattern(['당직', '비번', '휴무']);
                    else if (preset === '21주기 (주야비)') setShiftPattern(['주간','주간','주간','주간','주간','비번','야간','비번','야간','비번','야간','비번','야간','비번','당직','비번','비번','비번','비번','비번','비번']);
                  }}
                  className="w-full mt-1 bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="4조 2교대 (주야비휴)">4조 2교대 (주야비휴)</option>
                  <option value="3조 1교대 (당비비)">3조 1교대 (당비비)</option>
                  <option value="3조 2교대 (당비휴)">3조 2교대 (당비휴)</option>
                  <option value="21주기 (주야비)">21주기 (주야비)</option>
                  <option value="직접 입력">직접 입력...</option>
                </select>
              </div>

              {/* Custom Pattern Input */}
              {shiftPreset === '직접 입력' && (
                <div>
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">근무 패턴 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={shiftPattern.join(',')}
                    onChange={e => setShiftPattern(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="예: 주간,야간,비번,휴무"
                    className="w-full mt-1 bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}

              {/* Today's Shift Selector */}
              <div>
                <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">오늘의 근무는?</label>
                <select
                  value={getTodayShiftIndex()}
                  onChange={e => {
                    const idx = parseInt(e.target.value);
                    if (isNaN(idx)) return;
                    // Find anchor date: if today is index `idx`, anchor was `idx` days ago
                    const anchor = new Date(todayMidnight.getTime() - idx * 24 * 60 * 60 * 1000);
                    const anchorStr = `${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, '0')}-${String(anchor.getDate()).padStart(2, '0')}`;
                    setShiftAnchorDate(anchorStr);
                  }}
                  className="w-full mt-1 bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="" disabled>선택하세요</option>
                  {shiftPattern.map((s, i) => (
                    <option key={i} value={i}>{i + 1}일차 - {s}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 mt-2 flex-wrap">
                {shiftPattern.slice(0, 10).map((s, i) => (
                  <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded ${shiftColor(s)}`}>{s}</span>
                ))}
                {shiftPattern.length > 10 && <span className="text-[10px] text-on-surface-variant ml-1 font-bold">... (총 {shiftPattern.length}일 주기)</span>}
              </div>
            </div>
          </div>

          {/* Selected Date Detail */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-on-surface">
                {selectedDate
                  ? `${selectedDate.split('-')[1]}월 ${selectedDate.split('-')[2]}일`
                  : '날짜를 선택하세요'}
              </h4>
              {selectedDate && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-xs bg-primary text-on-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary/80 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">add</span> 추가
                </button>
              )}
            </div>

            {selectedDate ? (
              selectedSchedules.length > 0 ? (
                <div className="space-y-2">
                  {selectedSchedules.map(s => {
                    const tc = TYPE_COLORS[s.type];
                    return (
                      <div key={s.id} className={`${tc.bg} rounded-lg p-3 group`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className={`text-[10px] font-bold ${tc.text} uppercase`}>{s.type}</span>
                            <p className="text-sm font-bold text-on-surface mt-0.5">{s.title}</p>
                            {s.memo && <p className="text-xs text-on-surface-variant mt-1">{s.memo}</p>}
                          </div>
                          <button
                            onClick={() => deleteSchedule(s.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-on-surface-variant text-lg hover:text-error">close</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant text-center py-6">일정이 없습니다</p>
              )
            ) : (
              <p className="text-sm text-on-surface-variant text-center py-6">좌측 달력에서 날짜를 클릭하세요</p>
            )}
          </div>

          {/* Legend */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5">
            <h4 className="text-sm font-bold text-on-surface mb-3">범례</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TYPE_COLORS).map(([type, c]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`}></span>
                  <span className="text-xs text-on-surface-variant">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 w-[420px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-on-surface mb-4">
              📅 일정 추가 — {selectedDate.split('-')[1]}월 {selectedDate.split('-')[2]}일
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-on-surface-variant font-bold">유형</label>
                <div className="flex gap-2 mt-1">
                  {(Object.keys(TYPE_COLORS) as Schedule['type'][]).map(t => {
                    const tc = TYPE_COLORS[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setNewType(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          newType === t
                            ? `${tc.bg} ${tc.text} border-current`
                            : 'border-outline-variant/20 text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs text-on-surface-variant font-bold">제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="예: OO빌딩 종합점검"
                  className="w-full mt-1 bg-surface-container border border-outline-variant/20 rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-outline"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-on-surface-variant font-bold">메모 (선택)</label>
                <textarea
                  value={newMemo}
                  onChange={e => setNewMemo(e.target.value)}
                  placeholder="상세 내용..."
                  rows={3}
                  className="w-full mt-1 bg-surface-container border border-outline-variant/20 rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-outline"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-lg border border-outline-variant/20 text-on-surface-variant text-sm font-bold hover:bg-surface-container transition-colors">
                  취소
                </button>
                <button onClick={addSchedule} className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-bold hover:bg-primary/80 transition-colors">
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
