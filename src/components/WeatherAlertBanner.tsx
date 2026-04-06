import { useState, useEffect } from 'react';
import { fetchWeatherAlerts, type NewsItem } from '../services/newsApi';

export default function WeatherAlertBanner({ city }: { city: string }) {
  const [alert, setAlert] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchWeatherAlerts(city).then(data => {
      if (isMounted) {
        setAlert(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [city]);

  if (loading || !alert || !isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-800 border border-red-500 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 text-white shadow-xl shadow-red-900/20 mb-6 animate-fade-in">
      <div className="flex items-start gap-4 flex-1">
        <span className="material-symbols-outlined text-red-200 text-3xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm">🚨 기상청 속보 / 특보 발효 중!</p>
            <span className="bg-red-900/50 text-red-200 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">{alert.pubDate}</span>
          </div>
          <p className="text-white/90 text-sm mt-1 font-medium">
            {alert.title}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a 
          href={alert.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center text-xs bg-white text-red-700 font-bold px-4 h-8 rounded-lg hover:bg-red-50 transition-colors shadow-sm whitespace-nowrap"
        >
          원문 보기
        </a>
        <button 
          onClick={() => setIsVisible(false)} 
          className="flex items-center justify-center bg-red-900/40 text-red-100 w-8 h-8 rounded-lg hover:bg-red-900/60 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
}
