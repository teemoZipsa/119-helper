import { apiFetch } from './apiClient';

export interface DisasterMsg {
  create_date: string;
  location_id: string; // e.g., "116,117,118..."
  location_name: string; // e.g., "전라북도 군산시,전라북도 김제시..."
  md101_sn: string;
  msg: string;
  send_platform: string; // e.g., "cbs"
  msgType?: string; // e.g., "긴급", "안전" (Extracted or mapped if possible, currently we might have to infer it)
}

export const fetchDisasterMsgs = async (): Promise<DisasterMsg[]> => {
  try {
    const data: any = await apiFetch('/api/disaster-msg');
    
    if (data && Array.isArray(data.DisasterMsg?.[1]?.row)) {
      return data.DisasterMsg[1].row;
    }
    return [];
  } catch (error) {
    console.error('Error fetching disaster messages:', error);
    return [];
  }
};
