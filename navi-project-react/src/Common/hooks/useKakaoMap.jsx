import { useState, useEffect, useRef, useCallback } from "react";

/**
 * ✅ Kakao Map Hook (DB 좌표, 부드러운 이동, 마커 + 커스텀 오버레이 동시 적용)
 * @param {string} containerId - 지도 컨테이너 DOM id
 * @returns {object} { isMapLoaded, updateMap, resetMap }
 */
export const useKakaoMap = (containerId) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null); 
  const customOverlayRef = useRef(null); 
  const infoWindowRef = useRef(null); 

  // ⭐️ 커스텀 오버레이를 숨길 페이지의 컨테이너 ID를 정의합니다.
  const HIDE_OVERLAY_ID = 'kakao-detail-map-container';

  // 1️⃣ SDK 로드 및 초기화 (유지)
  useEffect(() => {
    const loadKakaoSDK = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsMapLoaded(true);
        });
      }
    };

    if (window.kakao && window.kakao.maps) {
      loadKakaoSDK();
    } else {
      const script = document.createElement("script");
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=64f77515cbf4b9bf257e664e44b1ab9b&autoload=false";
      script.async = true;
      script.onload = loadKakaoSDK;
      document.head.appendChild(script);
    }
  }, []);

  // 2️⃣ 지도 생성 또는 업데이트
  const updateMap = useCallback(
    (item) => { 
      const { title, latitude, longitude, thumbnailPath } = item; 

      if (!isMapLoaded) { 
          console.log("[KakaoMap Debug] Map SDK not ready. Skipping map update.");
          return;
      }

      const mapContainer = document.getElementById(containerId);
      if (!mapContainer) {
        console.error("지도 컨테이너를 찾을 수 없습니다:", containerId);
        return;
      }

      const { kakao } = window;
      let map = mapRef.current; 

      // 1. 유효한 DB 좌표 확인
      let coords;
      if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
          const lat = parseFloat(latitude);
          const lng = parseFloat(longitude);
          coords = new kakao.maps.LatLng(lat, lng);
          console.log(`[KakaoMap Success] Using DB coordinates: Lat ${lat}, Lng ${lng}`);
      } else {
          coords = new kakao.maps.LatLng(33.3926876, 126.4948419); 
          console.error(`[KakaoMap Error] DB coordinates invalid or missing. Setting map to default center.`);
      }

      // 지도 인스턴스가 없으면 새로 생성 (최초 1회)
      if (!map) {
          const mapOption = {
              center: coords, // 최초 중심 좌표도 DB 값 사용
              level: 9,
          };
          map = new kakao.maps.Map(mapContainer, mapOption);
          mapRef.current = map;
          map.relayout();
      }
      
      // 2. 기존 마커 및 오버레이 제거
      if (markerRef.current) markerRef.current.setMap(null);
      if (customOverlayRef.current) customOverlayRef.current.setMap(null);

      // 3. 마커 생성 및 지도에 표시 (모든 페이지에서 마커는 표시)
      const marker = new kakao.maps.Marker({ map, position: coords });
      markerRef.current = marker;

      // ⭐️ [수정] 현재 페이지가 상세 페이지(HIDE_OVERLAY_ID)인지 확인
      const shouldShowCustomOverlay = containerId !== HIDE_OVERLAY_ID;

      // 4. 커스텀 오버레이 처리 (조건부 생성 및 표시)
      if (shouldShowCustomOverlay) {
          // 오버레이를 표시해야 하는 경우에만 HTML 생성 및 오버레이 생성
          const imageSrc = thumbnailPath || 'https://placehold.co/100x100/cccccc/333333?text=No';

          const content = `
            <div style="
              width: 220px;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0px 5px 10px 0px rgba(0,0,0,0.1);
              font-family: sans-serif;
            ">
              <div style="width:100%; height:140px; overflow:hidden;  ">
                <img src="${imageSrc}" style="width:100%; height:100%; object-fit:cover;  border-radius: 12px;" 
                  onerror="this.onerror=null;this.src='https://placehold.co/220x140/cccccc/333333?text=No'"/>
              </div>
                <div style="padding:8px 12px; font-size:16px; font-weight:bold; color:#111; background: white;border-radius:0px 0px 12px 12px;">
                ${title}
              </div>
            </div>
          `;

          // 5. 커스텀 오버레이 생성 및 지도에 표시
          const customOverlay = new kakao.maps.CustomOverlay({
              map: map,
              position: coords,
              content: content,
              // 오버레이 위치 조정: 마커 위에 표시되도록 yAnchor 설정
              yAnchor: 1, 
              zIndex: 3,
          });
          
          customOverlayRef.current = customOverlay;
      }

      // 지도의 중심 이동 (부드럽게 panTo 유지)
      map.panTo(coords);
      map.relayout();
    },
    [isMapLoaded, containerId]
  );

  // 3️⃣ 지도 초기화 해제 
  const resetMap = useCallback(() => {
    mapRef.current = null;
    // 마커 및 오버레이 모두 제거
    if (markerRef.current) markerRef.current.setMap(null);
    if (customOverlayRef.current) customOverlayRef.current.setMap(null);
    markerRef.current = null;
    customOverlayRef.current = null;
    infoWindowRef.current = null;
  }, []);

  return { isMapLoaded, updateMap, resetMap };
};