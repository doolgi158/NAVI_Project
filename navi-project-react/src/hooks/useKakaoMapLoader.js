// import { useEffect, useState } from 'react';

// // API 키를 서버에서 가져와 스크립트를 동적으로 로드하는 훅
// export const useKakaoMapLoader = (apiUrl = '/api/config/kakao-key') => {
//     // 로딩 상태와 오류 상태 관리
//     const [isLoaded, setIsLoaded] = useState(false);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         // 이미 로드되었거나 kakao 객체가 존재하면 바로 종료
//         if (isLoaded || window.kakao) {
//             return;
//         }

//         let isMounted = true;
        
//         const loadKakaoMapScript = (appKey) => {
//             if (!appKey) {
//                 if (isMounted) setError(new Error("Kakao App Key is missing."));
//                 return;
//             }

//             const scriptId = 'kakao-map-sdk';
            
//             // 스크립트가 이미 DOM에 존재하는지 확인
//             if (document.getElementById(scriptId)) {
//                 if (isMounted) setIsLoaded(true);
//                 return;
//             }

//             const script = document.createElement('script');
//             script.id = scriptId;
//             script.type = 'text/javascript';
//             // services 라이브러리 추가
//             script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services`;
//             script.async = true;

//             script.onload = () => {
//                 if (isMounted) setIsLoaded(true);
//             };

//             script.onerror = () => {
//                 if (isMounted) setError(new Error('Failed to load Kakao Map script.'));
//             };

//             document.head.appendChild(script);
//         };
        
//         // 1. Spring Boot 서버에서 API 키 가져오기
//         fetch(apiUrl)
//             .then(res => {
//                 if (!res.ok) {
//                     throw new Error(`Failed to fetch config from server (Status: ${res.status})`);
//                 }
//                 return res.json();
//             })
//             .then(data => {
//                 const appKey = data.kakaoMapAppKey; 
//                 loadKakaoMapScript(appKey);
//             })
//             .catch(err => {
//                 console.error("Error fetching Kakao Key:", err);
//                 if (isMounted) setError(err);
//             });

//         return () => {
//             isMounted = false;
//         };
//     }, [apiUrl]); 

//     return { isLoaded, error };
// };
