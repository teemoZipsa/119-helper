import React, { useEffect, useState } from 'react';
import { fetchDisasterMsgs } from '../services/disasterMsgApi';
import type { DisasterMsg } from '../services/disasterMsgApi';

const DisasterTicker: React.FC = () => {
  const [messages, setMessages] = useState<DisasterMsg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await fetchDisasterMsgs();
        // 최신 메시지로 필터링/정렬 (이미 최신순이면 좋지만 안전하게)
        // 예를 들어 5개만 상단에 표시
        setMessages(msgs.slice(0, 5));
      } catch (error) {
        console.error("Failed to load disaster messages", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
    // 3분마다 갱신
    const interval = setInterval(loadMessages, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;
  if (messages.length === 0) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-6 rounded shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0 flex items-center h-full pt-1">
          <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-bold text-red-700 text-sm whitespace-nowrap">재난/안전 알림</span>
        </div>
        <div className="ml-3 flex-1 overflow-hidden">
          <div className="animate-ticker whitespace-nowrap">
            {messages.map((msg, idx) => (
              <span key={msg.md101_sn || idx} className="inline-block mr-8 text-sm text-red-800">
                <span className="font-semibold">[{msg.location_name.split(',')[0]} 등]</span> {msg.msg}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterTicker;
