import { useState, useEffect, useRef, useCallback } from "react";

export const useKakaoMap = (containerId) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const customOverlayRef = useRef(null);
  const infoWindowRef = useRef(null);

  const HIDE_OVERLAY_ID = "kakao-detail-map-container";
  const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

  /** ✅ Kakao SDK 로딩 (지연/재시도 대응) */
  useEffect(() => {
    let retryCount = 0;

    const ensureKakaoReady = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsMapLoaded(true);
        });
      } else if (retryCount < 10) {
        retryCount++;
        console.warn(`⏳ Kakao SDK not ready (retry ${retryCount})`);
        setTimeout(ensureKakaoReady, 300);
      } else {
      }
    };

    if (window.kakao && window.kakao.maps) {
      ensureKakaoReady();
    } else {
      const scriptId = "kakao-map-sdk";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&libraries=services&autoload=false`;
        script.async = true;
        script.onload = ensureKakaoReady;
        document.head.appendChild(script);
      } else {
        ensureKakaoReady();
      }
    }

    return () => {
    };
  }, [KAKAO_MAP_KEY]);

  /** ✅ 컨테이너 표시될 때까지 대기 */
  const _waitForContainerVisible = async (timeout = 1500) => {
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

  /** ✅ 안정적 relayout */
  const relayoutMap = useCallback(async () => {
    const container = document.getElementById(containerId);
    if (!mapRef.current || !container) {
      console.warn("[KakaoMap] relayoutMap: map or container not ready");
      return;
    }

    const ready = await _waitForContainerVisible(1500);
    if (!ready) {
      console.warn("[KakaoMap] relayout skipped — container not visible");
      return;
    }

    try {
      mapRef.current.relayout();
      if (window.kakao?.maps?.event) {
        try {
          window.kakao.maps.event.trigger(mapRef.current, "resize");
        } catch (err) {
          console.warn("[KakaoMap] resize trigger failed", err);
        }
      }

      const center = mapRef.current.getCenter();
      if (center) mapRef.current.setCenter(center);
    } catch (e) {
      console.warn("[KakaoMap] relayout error:", e);
    }
  }, [containerId]);

  /** ✅ 단일 아이템 지도 표시 (상세용 등) */
  const updateMap = useCallback(
    (item, { showOverlay = true } = {}) => {
      const { title, latitude, longitude } = item || {};

      // ✅ 썸네일 URL 정제
      const rawThumb = item?.thumbnailPath || "";
      const firstImage =
        Array.isArray(rawThumb)
          ? rawThumb[0]
          : typeof rawThumb === "string"
            ? rawThumb.split(",")[0].trim()
            : "";

      const imageSrc =
        firstImage && firstImage.startsWith("http")
          ? firstImage
          : "https://placehold.co/220x140/cccccc/333333?text=No+Image";

      if (!isMapLoaded) {
        console.warn("[KakaoMap] SDK not ready, skipping updateMap");
        return;
      }

      const container = document.getElementById(containerId);
      if (!container) {
        console.error("[KakaoMap] container not found:", containerId);
        return;
      }

      const { kakao } = window;
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const coords =
        isNaN(lat) || isNaN(lng)
          ? new kakao.maps.LatLng(33.3926876, 126.4948419)
          : new kakao.maps.LatLng(lat, lng);

      let map = mapRef.current;
      if (!map) {
        map = new kakao.maps.Map(container, { center: coords, level: 10 });
        mapRef.current = map;
      }

      if (markerRef.current) markerRef.current.setMap(null);
      if (customOverlayRef.current) customOverlayRef.current.setMap(null);

      // ✅ 마커 생성
      const marker = new kakao.maps.Marker({ map, position: coords });
      markerRef.current = marker;

      // ✅ 상세 페이지(mapId가 HIDE_OVERLAY_ID) 또는 showOverlay=false → 오버레이 숨김
      const shouldHideOverlay =
        containerId === HIDE_OVERLAY_ID || showOverlay === false;

      if (!shouldHideOverlay) {
        const content = `
          <div style="width: 220px; background: white; border-radius: 12px;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow: hidden;">
            <img src="${imageSrc}" style="width:100%; height:140px; object-fit:cover;"
              onerror="this.src='https://placehold.co/220x140/cccccc/333333?text=No+Image'"/>
            <div style="padding:8px 10px; font-weight:600; color:#222;">${title || ""}</div>
          </div>
        `;
        const overlay = new kakao.maps.CustomOverlay({
          map,
          position: coords,
          content,
          yAnchor: 1.3,
          zIndex: 2,
        });
        customOverlayRef.current = overlay;
      }

      map.panTo(coords);
    },
    [isMapLoaded, containerId]
  );

  /** ✅ 맵 초기화 */
  const resetMap = useCallback(() => {
    if (markerRef.current) markerRef.current.setMap(null);
    if (customOverlayRef.current) customOverlayRef.current.setMap(null);
    markerRef.current = null;
    customOverlayRef.current = null;
    mapRef.current = null;
    infoWindowRef.current = null;
  }, []);

  return { isMapLoaded, updateMap, relayoutMap, resetMap };
};
