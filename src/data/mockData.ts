// 소화전/급수탑 Mock 데이터 (추후 API 연동 시 교체)
export interface FireFacility {
  id: string;
  type: '소화전' | '급수탑' | '저수조' | '비상소화장치';
  address: string;
  lat: number;
  lng: number;
  district: string;
  status: '정상' | '점검필요' | '고장';
}

export const MOCK_HYDRANTS: FireFacility[] = [
  { id: 'H-001', type: '소화전', address: '서울특별시 종로구 세종대로 209', lat: 37.5759, lng: 126.9769, district: '종로구', status: '정상' },
  { id: 'H-002', type: '소화전', address: '서울특별시 종로구 창경궁로 185', lat: 37.5796, lng: 126.9930, district: '종로구', status: '정상' },
  { id: 'H-003', type: '소화전', address: '서울특별시 중구 을지로 100', lat: 37.5660, lng: 126.9824, district: '중구', status: '점검필요' },
  { id: 'H-004', type: '소화전', address: '서울특별시 용산구 이태원로 22', lat: 37.5340, lng: 126.9948, district: '용산구', status: '정상' },
  { id: 'H-005', type: '소화전', address: '서울특별시 강남구 테헤란로 152', lat: 37.5012, lng: 127.0396, district: '강남구', status: '정상' },
  { id: 'H-006', type: '소화전', address: '서울특별시 마포구 홍익로 20', lat: 37.5563, lng: 126.9236, district: '마포구', status: '고장' },
  { id: 'H-007', type: '소화전', address: '서울특별시 서초구 반포대로 201', lat: 37.4969, lng: 127.0025, district: '서초구', status: '정상' },
  { id: 'H-008', type: '소화전', address: '서울특별시 송파구 올림픽로 300', lat: 37.5145, lng: 127.1059, district: '송파구', status: '정상' },
];

export const MOCK_WATER_TOWERS: FireFacility[] = [
  { id: 'W-001', type: '급수탑', address: '서울특별시 종로구 창경궁로 254', lat: 37.5820, lng: 126.9989, district: '종로구', status: '정상' },
  { id: 'W-002', type: '급수탑', address: '서울특별시 동대문구 왕산로 214', lat: 37.5744, lng: 127.0098, district: '동대문구', status: '정상' },
  { id: 'W-003', type: '저수조', address: '서울특별시 강북구 도봉로 315', lat: 37.6397, lng: 127.0259, district: '강북구', status: '점검필요' },
  { id: 'W-004', type: '급수탑', address: '서울특별시 영등포구 여의대로 24', lat: 37.5219, lng: 126.9245, district: '영등포구', status: '정상' },
  { id: 'W-005', type: '저수조', address: '서울특별시 노원구 상계로 70', lat: 37.6543, lng: 127.0568, district: '노원구', status: '정상' },
  { id: 'W-006', type: '비상소화장치', address: '서울특별시 관악구 관악로 145', lat: 37.4783, lng: 126.9516, district: '관악구', status: '정상' },
];

export const MOCK_WEATHER = {
  temperature: 18.5,
  humidity: 62,
  windSpeed: 3.2,
  windDirection: '북서',
  sky: '맑음',
  precipitation: 0,
  pm10: 45,
  pm25: 22,
  alerts: [
    { type: '건조주의보', region: '서울·경기', issued: '2025-03-31 06:00' },
  ],
};

export const MOCK_ER_DATA = [
  { name: '서울대학교병원', available: 3, total: 15, distance: 2.1, tel: '02-2072-2114', lat: 37.5795, lng: 126.9989, trauma: true, ct: true, mri: true },
  { name: '세브란스병원', available: 5, total: 20, distance: 4.3, tel: '02-2228-0114', lat: 37.5622, lng: 126.9410, trauma: true, ct: true, mri: true },
  { name: '삼성서울병원', available: 2, total: 18, distance: 6.7, tel: '02-3410-2114', lat: 37.4881, lng: 127.0857, trauma: true, ct: true, mri: false },
  { name: '아산병원', available: 7, total: 25, distance: 5.2, tel: '02-3010-3114', lat: 37.5268, lng: 127.1083, trauma: true, ct: true, mri: true },
  { name: '고려대학교안암병원', available: 4, total: 12, distance: 3.8, tel: '02-920-5114', lat: 37.5867, lng: 127.0288, trauma: false, ct: true, mri: true },
  { name: '중앙대학교병원', available: 0, total: 10, distance: 7.1, tel: '02-6299-1114', lat: 37.5015, lng: 126.9979, trauma: false, ct: true, mri: false },
];
