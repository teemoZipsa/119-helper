const BASE = 'https://119-helper-api.teemozipsa.workers.dev';
const endpoints = [
  { name: 'Weather (now)', url: '/api/weather/now?nx=60&ny=127' },
  { name: 'Air Quality', url: '/api/air?sido=' + encodeURIComponent('서울') },
  { name: 'ER Beds', url: '/api/er/beds?sido=' + encodeURIComponent('서울특별시') },
  { name: 'Building', url: '/api/building?sigunguCd=11680&bjdongCd=10100' },
  { name: 'Multi-Use Facility', url: '/api/multiuse?ctprvnNm=' + encodeURIComponent('서울특별시') },
  { name: 'Shelter (Tsunami)', url: '/api/shelter?ctprvnNm=' + encodeURIComponent('서울특별시') },
  { name: 'Shelter (Civil)', url: '/api/civil-shelter?ctprvnNm=' + encodeURIComponent('서울특별시') },
  { name: 'Emergency Stats', url: '/api/emergency/stats/activity?reqYm=202312' },
  { name: 'Fire Info', url: '/api/fire/station' },
  { name: 'Fire Object', url: '/api/fire-object/accom?ctpvNm=' + encodeURIComponent('서울특별시') },
  { name: 'Fire Damage', url: '/api/fire-damage' },
  { name: 'Annual Fire (2023)', url: '/api/fire-annual/2023' },
  { name: 'News', url: '/api/news?type=google&query=소방' }
];

async function testAll() {
  console.log('Testing APIs...');
  for (const ep of endpoints) {
    try {
      const res = await fetch(BASE + ep.url, { headers: { 'Origin': 'http://localhost:5173' } });
      const text = await res.text();
      let status = res.status;
      let ok = res.ok;
      let errorMsg = '';
      if (!ok) {
        try {
           const j = JSON.parse(text);
           errorMsg = j.error || text.substring(0, 50);
        } catch {
           errorMsg = text.substring(0, 50).replace(/\n/g, ' ');
        }
      } else {
        if (text.includes('<resultCode>01</resultCode>') || text.includes('<resultCode>10</resultCode>') || text.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) {
          ok = false;
          status = 'XML ERROR';
          errorMsg = 'API Key Error/Unregistered';
        } else if (text.includes('LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR') || text.includes('<resultCode>22</resultCode>')) {
          ok = false;
          status = 'XML EXCEEDED';
          errorMsg = 'Request Limit Exceeded';
        } else if (text.length === 0) {
          ok = false;
          status = 'EMPTY';
          errorMsg = 'Empty response body';
        }
      }
      console.log(`[${ok ? 'OK' : 'FAIL'}] ${ep.name} (${status})${errorMsg ? ' - ' + errorMsg : ''}`);
    } catch (e) {
      console.log(`[FAIL] ${ep.name} - ${e.message}`);
    }
  }
}
testAll();
