import { useState } from 'react';

export default function BuildingView() {
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
