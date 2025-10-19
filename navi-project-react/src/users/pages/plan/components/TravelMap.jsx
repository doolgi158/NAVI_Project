import React, { useEffect, useRef, useMemo } from "react";
import { useKakaoMap } from "../../../../common/hooks/useKakaoMap";

export default function TravelMap({ markers = [], step }) {
  const { isMapLoaded } = useKakaoMap("kakao-map-container");
  const mapRef = useRef(null);
  const markerRefs = useRef([]);
  const overlayRefs = useRef([]);
  const lineRefs = useRef([]);
  const containerId = "kakao-map-container";

  /** ✅ 중복된 숙소 제거 + S1, S2 부여 */
  const processedStays = useMemo(() => {
    const stays = markers.filter((m) => m.type === "stay");
    if (!stays.length) return [];

    const grouped = [];
    let lastTitle = null;
    stays.forEach((s) => {
      const currentTitle = s.title || s.accId;
      if (currentTitle !== lastTitle) {
        grouped.push(s);
        lastTitle = currentTitle;
      }
    });

    return grouped.map((s, idx) => ({
      ...s,
      stayOrder: idx + 1,
    }));
  }, [markers]);

  /** ✅ 지도 초기화 */
  useEffect(() => {
    if (!isMapLoaded) return;
    const { kakao } = window;
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!mapRef.current) {
      mapRef.current = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(33.36167, 126.52917),
        level: 9,
      });
    }

    const map = mapRef.current;
    const refresh = () => {
      if (!container.offsetWidth || !container.offsetHeight) return;
      map.relayout();
      map.setCenter(new kakao.maps.LatLng(33.36167, 126.52917));
    };

    const timeout = setTimeout(refresh, 1000);
    window.addEventListener("resize", refresh);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", refresh);
    };
  }, [isMapLoaded]);

  /** ✅ step 변경 시 리레이아웃 */
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    const fix = () => {
      map.relayout();
      const c = map.getCenter() || new window.kakao.maps.LatLng(33.36167, 126.52917);
      map.setCenter(c);
    };
    const t = setTimeout(fix, 800);
    return () => clearTimeout(t);
  }, [step, isMapLoaded]);

  /** ✅ 마커 및 경로 갱신 */
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    const { kakao } = window;
    const map = mapRef.current;

    markerRefs.current.forEach((m) => m.setMap(null));
    overlayRefs.current.forEach((o) => o.setMap(null));
    lineRefs.current.forEach((l) => l.setMap(null));
    markerRefs.current = [];
    overlayRefs.current = [];
    lineRefs.current = [];

    if (!markers.length) return;

    const travels = markers.filter((m) => m.type === "travel");
    const stays = processedStays;

    /** 🟣 여행지 마커 */
    travels.forEach((m, idx) => {
      const lat = parseFloat(m.latitude);
      const lng = parseFloat(m.longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      const pos = new kakao.maps.LatLng(lat, lng);

      const markerHtml = `
        <div style="
          background:#6846FF;color:white;font-weight:bold;
          border-radius:50%;width:32px;height:32px;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);border:2px solid white;">
          ${idx + 1}
        </div>`;
      const marker = new kakao.maps.CustomOverlay({ position: pos, content: markerHtml, yAnchor: 1 });
      marker.setMap(map);
      markerRefs.current.push(marker);

      const tooltip = new kakao.maps.CustomOverlay({
        position: pos,
        content: `
          <div style="
            background:white;border-radius:8px;padding:4px 8px;
            font-size:13px;font-weight:600;color:#333;
            box-shadow:0 2px 6px rgba(0,0,0,0.15);
            border:1px solid #ddd;">📍 ${m.title}</div>`,
        yAnchor: 1.8,
      });
      const el = marker.a || marker.content;
      if (el) {
        el.addEventListener("mouseenter", () => tooltip.setMap(map));
        el.addEventListener("mouseleave", () => tooltip.setMap(null));
      }
      overlayRefs.current.push(tooltip);
    });

    /** 🔴 숙소 마커 + Day 라벨 */
    stays.forEach((s) => {
      const lat = parseFloat(s.latitude);
      const lng = parseFloat(s.longitude);
      if (isNaN(lat) || isNaN(lng)) {
        console.warn("[StayMarker Skip]", s);
        return;
      }
      const pos = new kakao.maps.LatLng(lat, lng);

      // 🔴 숙소 S1, S2
      const markerHtml = `
        <div style="
          background:#E53935;color:white;font-weight:bold;
          border-radius:50%;width:30px;height:30px;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);
          border:2px solid white;">S${s.stayOrder}</div>`;
      const marker = new kakao.maps.CustomOverlay({ position: pos, content: markerHtml, yAnchor: 1 });
      marker.setMap(map);
      markerRefs.current.push(marker);


    });

    /** 마커연결 */
    if (travels.length > 1) {
      const path = travels.map((m) => new kakao.maps.LatLng(m.latitude, m.longitude));

      const polyline = new kakao.maps.Polyline({
        path,
        strokeWeight: 5,
        strokeColor: "#6846FF",
        strokeOpacity: 0.9,
        strokeStyle: "solid",
      });
      polyline.setMap(map);
      lineRefs.current.push(polyline);
    }

    /** 📍 지도 범위 맞춤 */
    const bounds = new kakao.maps.LatLngBounds();
    markers.forEach((m) => {
      if (!isNaN(m.latitude) && !isNaN(m.longitude)) {
        bounds.extend(new kakao.maps.LatLng(m.latitude, m.longitude));
      }
    });
    requestAnimationFrame(() => {
      if (!bounds.isEmpty()) {
        map.relayout();
        map.setBounds(bounds);
      }
    });
  }, [isMapLoaded, markers, processedStays]);

  return (
    <div
      id={containerId}
      style={{
        width: "100%",
        height: "calc(100vh - 100px)",
        minHeight: "400px",
        background: "#f8fafc",
      }}
    >
      {!isMapLoaded && (
        <div className="flex items-center justify-center h-full text-gray-500">
          카카오맵 로딩 중...
        </div>
      )}
    </div>
  );
}
