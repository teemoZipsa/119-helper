import { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: string;
  onCityChange: (c: string) => void;
  cityNames: Record<string, string>;
  theme: string;
  onThemeChange: (t: string) => void;
}

const THEME_OPTIONS = [
  { value: 'dark', label: '다크 모드', icon: 'dark_mode', desc: '어두운 배경에 밝은 텍스트' },
  { value: 'light', label: '라이트 모드', icon: 'light_mode', desc: '밝은 배경에 어두운 텍스트' },
  { value: 'system', label: '시스템 설정', icon: 'settings_suggest', desc: 'OS 설정에 따라 자동 전환' },
];

export default function SettingsModal({ isOpen, onClose, city, onCityChange, cityNames, theme, onThemeChange }: SettingsModalProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState('5');
  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    setSoundEnabled(localStorage.getItem('119helper-sound') === 'true');
    setRefreshInterval(localStorage.getItem('119helper-refresh') || '5');
    setLocalTheme(theme);
  }, [isOpen, theme]);

  const handleSave = () => {
    localStorage.setItem('119helper-sound', soundEnabled.toString());
    localStorage.setItem('119helper-refresh', refreshInterval);
    onThemeChange(localTheme);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 z-50 p-2">
      <div className="bg-surface-container-high border border-outline-variant/20 rounded-2xl shadow-xl w-80 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="p-3 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">settings</span>
            환경 설정
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>
        
        <div className="p-5 space-y-6">
          {/* Theme Section */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 block">테마 설정</label>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setLocalTheme(opt.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    localTheme === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant/20 text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl"
                    style={localTheme === opt.value ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >{opt.icon}</span>
                  <span className="text-[10px] font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Notification */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 block">알림 설정</label>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface">긴급 상황 경고음</p>
                <p className="text-xs text-on-surface-variant">재난 알림 / 중증 환자 발생 시</p>
              </div>
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full transition-all ${soundEnabled ? 'left-6 bg-on-primary' : 'left-1 bg-on-surface-variant'}`} />
              </button>
            </div>
          </div>

          {/* Section 2: Data */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 block">데이터 설정</label>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-on-surface">자동 새로고침</p>
                  <p className="text-xs text-on-surface-variant">데이터 갱신 주기</p>
                </div>
                <select 
                  value={refreshInterval}
                  onChange={e => setRefreshInterval(e.target.value)}
                  className="bg-surface-container-high text-on-surface text-sm rounded-lg px-2 py-1.5 border border-outline-variant/20 focus:outline-none focus:border-primary"
                >
                  <option value="1">1분마다</option>
                  <option value="5">5분마다</option>
                  <option value="10">10분마다</option>
                  <option value="0">수동 갱신</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-on-surface">기본 관심 지역</p>
                  <p className="text-xs text-on-surface-variant">접속 시 최초 로딩 지역</p>
                </div>
                <select 
                  value={city}
                  onChange={e => onCityChange(e.target.value)}
                  className="bg-surface-container-high text-on-surface text-sm rounded-lg px-2 py-1.5 border border-outline-variant/20 focus:outline-none focus:border-primary"
                >
                  {Object.entries(cityNames).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors"
          >
            취소
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm font-bold bg-primary text-on-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
