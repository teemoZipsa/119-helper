import { useState, useEffect } from 'react';
import { fetchPolicyNews, type NewsItem } from '../services/newsApi';

export default function PolicyDashboard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNews = async (forceRefresh = false) => {
    setLoading(true);
    const data = await fetchPolicyNews(forceRefresh);
    setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-on-surface flex items-center gap-2 font-headline">
            <span className="material-symbols-outlined text-purple-500">gavel</span>
            정부 정책 및 입법 동향
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">소방청, 행정안전부, 보건복지부 지침 및 국회 입법예고</p>
        </div>
        <button 
          onClick={() => loadNews(true)}
          className="p-2 rounded-full bg-surface-variant text-on-surface hover:bg-surface-tint hover:text-white transition-colors flex items-center shadow-sm"
          title="새로고침"
        >
          <span className={`material-symbols-outlined ${loading && news.length === 0 ? 'animate-spin' : ''}`}>refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl animate-spin mb-4 text-purple-400">progress_activity</span>
          <p>전 부처 정책 정보를 수집 중입니다...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {news.map(item => (
            <a 
              key={item.id} 
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-surface-container-lowest border border-outline-variant/10 rounded-2xl overflow-hidden hover:shadow-lg hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              <div className="p-5 flex-1">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className={`${item.isOfficial ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'bg-surface-container-high text-on-surface'} px-2.5 py-1 rounded-full font-bold flex items-center gap-1`}>
                    {item.isOfficial && <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>}
                    {item.source}
                  </span>
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {item.pubDate}
                  </span>
                </div>
                
                <h3 className="text-on-surface font-bold text-base leading-snug mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                
                {item.description && (
                  <p className="text-on-surface-variant text-xs line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="px-5 py-3 bg-surface-container-low/50 border-t border-outline-variant/5 text-xs text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 group-hover:bg-purple-500/5 transition-colors">
                <span className="material-symbols-outlined text-[14px]">read_more</span>
                원문 확인하기
              </div>
            </a>
          ))}
          {news.length === 0 && (
            <div className="col-span-full py-16 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/20">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
              <p>현재 불러올 수 있는 정책 뉴스가 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
