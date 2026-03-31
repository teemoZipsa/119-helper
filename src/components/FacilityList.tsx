import { useState } from 'react';
import type { FireFacility } from '../data/mockData';

interface Props {
  data: FireFacility[];
  title: string;
  icon: string;
  typeLabel: string;
}

export default function FacilityList({ data, title, icon, typeLabel }: Props) {
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('전체');

  const districts = ['전체', ...Array.from(new Set(data.map(d => d.district)))];

  const filtered = data.filter(item => {
    const matchSearch = item.address.includes(search) || item.id.includes(search);
    const matchDistrict = selectedDistrict === '전체' || item.district === selectedDistrict;
    return matchSearch && matchDistrict;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case '정상': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case '점검필요': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case '고장': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const statusDot = (status: string) => {
    switch (status) {
      case '정상': return 'bg-green-400';
      case '점검필요': return 'bg-yellow-400';
      case '고장': return 'bg-red-400 animate-pulse';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-on-surface font-headline">{icon} {title}</h2>
          <p className="text-sm text-on-surface-variant mt-1">{typeLabel} 위치 정보 — API 연동 시 실시간 데이터로 전환됩니다</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-on-surface-variant">총 <span className="font-bold text-primary">{filtered.length}</span>건</span>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden relative" style={{ height: '300px' }}>
        <div className="absolute inset-0 bg-surface-dim flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-outline/40">map</span>
            <p className="text-on-surface-variant text-sm mt-2">지도 위젯 영역</p>
            <p className="text-outline text-xs mt-1">카카오맵 연동 시 {typeLabel} 마커가 표시됩니다</p>
          </div>
        </div>
        {/* Status overlay */}
        <div className="absolute top-4 left-4 z-10 bg-surface-container-lowest/90 backdrop-blur-sm p-3 rounded-xl border border-outline-variant/20">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span className="text-on-surface-variant">정상 {data.filter(d => d.status === '정상').length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              <span className="text-on-surface-variant">점검필요 {data.filter(d => d.status === '점검필요').length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span className="text-on-surface-variant">고장 {data.filter(d => d.status === '고장').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="주소 또는 ID로 검색..."
          className="flex-1 bg-surface-container border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="bg-surface-container border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {districts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container/50">
              <th className="px-6 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">ID</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">유형</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">주소</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">관할구</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">상태</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">좌표</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-surface-container/30 transition-colors">
                <td className="px-6 py-4 font-mono text-sm font-bold text-primary">{item.id}</td>
                <td className="px-6 py-4 text-sm text-on-surface">{item.type}</td>
                <td className="px-6 py-4 text-sm text-on-surface">{item.address}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{item.district}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColor(item.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot(item.status)}`}></span>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-xs text-on-surface-variant font-mono">
                  {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl opacity-30">search_off</span>
            <p className="mt-2">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
