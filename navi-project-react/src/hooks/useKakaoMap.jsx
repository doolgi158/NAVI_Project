import { useState, useEffect, useRef, useCallback } from "react";

/**
 * ✅ Kakao Map Hook (Geocoding 로직 제거, DB 좌표만 사용)
 * @param {string} containerId - 지도 컨테이너 DOM id
 * @returns {object} { isMapLoaded, updateMap, resetMap }
 */
export const useKakaoMap = (containerId) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);

  // 1️⃣ SDK 로드 및 초기화
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
    // item 객체 전체를 인수로 받음
    (item) => { 
      // DB에서 가져온 위도(latitude), 경도(longitude) 값을 직접 사용
      const { title, latitude, longitude } = item; 

   
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
      } else {
          // 2. 좌표가 없거나 유효하지 않으면 기본 좌표 사용
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
      
      // 마커/인포윈도우 설정
      if (markerRef.current) markerRef.current.setMap(null);
      if (infoWindowRef.current) infoWindowRef.current.close();
      const marker = new kakao.maps.Marker({ map, position: coords });
      const infoWindow = new kakao.maps.InfoWindow({ content: `<div style="padding:5px 10px;">${title}</div>` });
      infoWindow.open(map, marker);
      markerRef.current = marker;
      infoWindowRef.current = infoWindow;

      // 지도의 중심 이동
      map.setCenter(coords);
      map.relayout();
    },
    [isMapLoaded, containerId] 
  );

  // 3️⃣ 지도 초기화 해제
  const resetMap = useCallback(() => {
    mapRef.current = null;
    markerRef.current = null;
    infoWindowRef.current = null;
  }, []);

  // isGeocoderReady 반환 제거
  return { isMapLoaded, updateMap, resetMap };
};