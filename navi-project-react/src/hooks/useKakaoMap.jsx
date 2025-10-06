// import { useEffect, useRef, useState } from 'react';

// // Kakao Map 객체를 전역 window 객체에서 가져오기 위한 타입 정의
// const { kakao } = window;

// /**
//  * 지도 컨테이너 ref와 초기 중심 좌표를 받아 Kakao Map 인스턴스를 생성하고 반환하는 Hook
//  * @param {object} mapContainerRef - 지도를 표시할 HTML 요소의 ref 객체
//  * @param {number} latitude - 초기 중심 위도
//  * @param {number} longitude - 초기 중심 경도
//  * @returns {object | null} Kakao Map 인스턴스 또는 null
//  */
// export const useKakaoMap = (mapContainerRef, latitude, longitude) => {
//     const [mapInstance, setMapInstance] = useState(null);
//     const mapLoaded = useRef(false);

//     useEffect(() => {
//         // kakao 객체와 ref가 준비되었는지 확인
//         if (mapContainerRef.current && kakao && !mapLoaded.current) {
            
//             // 1. 지도 중심 좌표 설정 (여행지의 좌표)
//             const mapCenter = new kakao.maps.LatLng(latitude, longitude);
            
//             // 2. 지도 옵션 설정
//             const mapOptions = {
//                 center: mapCenter, 
//                 level: 3 // 지도 확대 레벨 (숫자가 낮을수록 확대)
//             };
            
//             // 3. 지도 인스턴스 생성
//             const map = new kakao.maps.Map(mapContainerRef.current, mapOptions);
            
//             setMapInstance(map);
//             mapLoaded.current = true; // 지도 로딩 완료 표시

//             // 4. 마커 표시 (선택 사항)
//             new kakao.maps.Marker({
//                 map: map,
//                 position: mapCenter,
//                 title: '여행지 위치'
//             });
            
//             // cleanup 함수: 컴포넌트 언마운트 시 추가적인 정리 작업 (필요한 경우)
//             return () => {
//                 // 예를 들어, 이벤트 리스너 제거 등의 작업
//             };
//         }
//     }, [latitude, longitude]); // 좌표가 변경될 때마다 지도를 다시 로드하도록 설정

//     return mapInstance;
// };
