import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Kakao Map Hook
 */
export const useKakaoMap = (containerId) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const customOverlayRef = useRef(null);
  const infoWindowRef = useRef(null);

  const HIDE_OVERLAY_ID = 'kakao-detail-map-container';

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
      script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=64f77515cbf4b9bf257e664e44b1ab9b&libraries=services&autoload=false";
      script.async = true;
      script.onload = loadKakaoSDK;
      document.head.appendChild(script);
    }
  }, []);

  // wait until container has non-zero size (up to timeout)
  const _waitForContainerVisible = async (timeout = 1200) => {
    const start = performance.now();
    return new Promise((resolve) => {
      function check() {
        const container = document.getElementById(containerId);
        if (container) {
          const w = container.clientWidth || 0;
          const h = container.clientHeight || 0;
          if (w > 10 && h > 10) return resolve(true);
        }
        if (performance.now() - start > timeout) return resolve(false);
        requestAnimationFrame(check);
      }
      check();
    });
  };

  // relayoutMap: 안정적으로 relayout + resize + setCenter 수행
  const relayoutMap = useCallback(async () => {

    if (!mapRef.current) {
      console.warn("[KakaoMap] relayoutMap called but mapRef is null");
      return;
    }

    const containerReady = await _waitForContainerVisible(1200);
    if (!containerReady) {
      console.warn("[KakaoMap] container not visible or zero size when relayout attempted");
    }

    try {
      // relayout if available
      if (typeof mapRef.current.relayout === "function") {
        mapRef.current.relayout();
      }
      if (window.kakao && window.kakao.maps && window.kakao.maps.event) {
        try {
          window.kakao.maps.event.trigger(mapRef.current, "resize");
        } catch (e) {
          // 일부 환경에서 trigger(mapRef.current, 'resize') 실패할 수 있으므로 안전히 캐치
          console.warn("[KakaoMap] kakao.maps.event.trigger resize failed:", e);
        }
      }
      // restore center if possible
      if (typeof mapRef.current.getCenter === "function" && typeof mapRef.current.setCenter === "function") {
        const currentCenter = mapRef.current.getCenter();
        if (currentCenter) {
          mapRef.current.setCenter(currentCenter);
        }
      }
    } catch (err) {
    }
  }, [containerId]);

  // updateMap: create map if needed and set marker/overlay
  const updateMap = useCallback(
    (item) => {
      const { title, latitude, longitude, thumbnailPath } = item || {};

      if (!isMapLoaded) {
        console.log("[KakaoMap] SDK not ready. Skipping updateMap.");
        return;
      }

      const mapContainer = document.getElementById(containerId);
      if (!mapContainer) {
        console.error("[KakaoMap] map container not found:", containerId);
        return;
      }

      const { kakao } = window;
      let map = mapRef.current;

      // coords
      let coords;
      if (latitude !== undefined && longitude !== undefined && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        coords = new kakao.maps.LatLng(lat, lng);
      } else {
        coords = new kakao.maps.LatLng(33.3926876, 126.4948419);
      }

      // 지도 인스턴스가 없으면 새로 생성 (최초 1회)
      if (!map) {
        const mapOption = { center: coords, level: 9 };
        map = new kakao.maps.Map(mapContainer, mapOption);
        mapRef.current = map;
      }
      
      // 2. 기존 마커 및 오버레이 제거
      if (markerRef.current) markerRef.current.setMap(null);
      if (customOverlayRef.current) customOverlayRef.current.setMap(null);

      // 3. 마커 생성 및 지도에 표시 (모든 페이지에서 마커는 표시)
      const marker = new kakao.maps.Marker({ map, position: coords });
      markerRef.current = marker;

      // 현재 페이지가 상세 페이지(HIDE_OVERLAY_ID)인지 확인
      const shouldShowOverlay = containerId !== HIDE_OVERLAY_ID;
      if (shouldShowOverlay) {
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
                ${title || ""}
              </div>
            </div>
          `;

          // 5. 커스텀 오버레이 생성 및 지도에 표시
          const customOverlay = new kakao.maps.CustomOverlay({
          map,
          position: coords,
          content,
          yAnchor: 1,
          zIndex: 3,
        });
        customOverlayRef.current = customOverlay;
      }

      // panTo
      try {
        map.panTo(coords);
      } catch (e) {
        // 안전 처리
        console.warn("[KakaoMap] panTo failed:", e);
      }
    },
    [isMapLoaded, containerId]
  );

  // 3️⃣ 지도 초기화 해제 
  const resetMap = useCallback(() => {
    mapRef.current = null;
    if (markerRef.current) markerRef.current.setMap(null);
    if (customOverlayRef.current) customOverlayRef.current.setMap(null);
    markerRef.current = null;
    customOverlayRef.current = null;
    infoWindowRef.current = null;
  }, []);

   return { isMapLoaded, updateMap, relayoutMap, resetMap };
};