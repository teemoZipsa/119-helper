/**
 * 카카오맵 SDK 동적 로더
 * 
 * 기존 문제: index.html의 정적 <script> 태그로 로드 시 Vite 환경변수 치환 실패,
 * 타이밍 이슈, 네트워크 오류 시 복구 불가능 등의 문제 발생
 * 
 * 해결: 런타임에 동적으로 스크립트를 삽입하여 안정적으로 로드
 */

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY || '';

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

let loadState: LoadState = 'idle';
let loadPromise: Promise<void> | null = null;
let errorMessage = '';

/** 카카오맵 SDK 로드 (캐싱 — 여러 번 호출해도 안전) */
export function loadKakaoMapSDK(): Promise<void> {
  // 이미 로드됨
  if (window.kakao?.maps) {
    loadState = 'loaded';
    return Promise.resolve();
  }

  // 이미 로드 중이면 기존 Promise 반환
  if (loadPromise) return loadPromise;

  if (!KAKAO_MAP_KEY) {
    loadState = 'error';
    errorMessage = 'VITE_KAKAO_MAP_KEY가 설정되지 않았습니다.';
    return Promise.reject(new Error(errorMessage));
  }

  loadState = 'loading';

  loadPromise = new Promise<void>((resolve, reject) => {
    // 기존 스크립트가 있으면 제거
    const existing = document.querySelector('script[src*="dapi.kakao.com"]');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services,clusterer`;
    script.async = true;

    script.onload = () => {
      // autoload=false이므로 수동으로 로드
      if (window.kakao?.maps) {
        window.kakao.maps.load(() => {
          loadState = 'loaded';
          console.log('[KakaoMap] SDK 로드 완료');
          resolve();
        });
      } else {
        loadState = 'error';
        errorMessage = '카카오맵 SDK 스크립트는 로드되었으나 kakao 객체가 없습니다.';
        reject(new Error(errorMessage));
      }
    };

    script.onerror = () => {
      loadState = 'error';
      errorMessage = '카카오맵 SDK 스크립트 로드 실패. 네트워크 또는 AdBlock 확인.';
      console.error('[KakaoMap]', errorMessage);
      // 재시도 가능하도록 리셋
      loadPromise = null;
      reject(new Error(errorMessage));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/** 현재 로드 상태 확인 */
export function getKakaoLoadState(): LoadState {
  return loadState;
}

/** 에러 메시지 */
export function getKakaoError(): string {
  return errorMessage;
}

/** 재시도 */
export function retryKakaoLoad(): Promise<void> {
  loadPromise = null;
  loadState = 'idle';
  errorMessage = '';
  return loadKakaoMapSDK();
}
