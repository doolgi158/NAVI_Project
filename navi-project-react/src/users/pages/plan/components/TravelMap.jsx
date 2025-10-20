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
      const c =
        map.getCenter() || new window.kakao.maps.LatLng(33.36167, 126.52917);
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

    // 이전 마커/오버레이/라인 제거
    markerRefs.current.forEach((m) => m.setMap(null));
    overlayRefs.current.forEach((o) => o.setMap(null));
    lineRefs.current.forEach((l) => l.setMap(null));
    markerRefs.current = [];
    overlayRefs.current = [];
    lineRefs.current = [];

    if (!markers.length) return;

    // ✅ 타입별 구분
    const travels = markers.filter((m) => m.type === "travel");
    const stays = markers.filter((m) => m.type === "stay");
    const pois = markers.filter((m) => m.type === "poi");

    /** ✅ 마커 생성 함수 (타입별 스타일 적용) */
    const createMarker = (m, idx, color, label) => {
      const lat = parseFloat(m.latitude);
      const lng = parseFloat(m.longitude);
      if (isNaN(lat) || isNaN(lng)) return null;

      const pos = new kakao.maps.LatLng(lat, lng);

      const markerHtml = `
        <div style="
          background:${color};
          color:white;
          font-weight:bold;
          border-radius:50%;
          width:30px;
          height:30px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:13px;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);
          border:2px solid white;">
          ${idx + 1}
        </div>`;

      const marker = new kakao.maps.CustomOverlay({
        position: pos,
        content: markerHtml,
        yAnchor: 1,
      });
      marker.setMap(map);

      // Tooltip Overlay
      const tooltip = new kakao.maps.CustomOverlay({
        position: pos,
        content: `
          <div style="
            background:white;
            border-radius:8px;
            padding:4px 8px;
            font-size:12px;
            font-weight:600;
            color:#333;
            border:1px solid #ccc;
            box-shadow:0 1px 4px rgba(0,0,0,0.2);">
            ${label} ${m.title}
          </div>`,
        yAnchor: 1.8,
      });

      const el = marker.a || marker.content;
      if (el) {
        el.addEventListener("mouseenter", () => tooltip.setMap(map));
        el.addEventListener("mouseleave", () => tooltip.setMap(null));
      }

      markerRefs.current.push(marker);
      overlayRefs.current.push(tooltip);
      return pos;
    };

    /** ✅ 마커 순서대로 추가 (경로용 Path 생성) */
    const path = [];
    markers.forEach((m, idx) => {
      let color = "#2F3E46";
      let label = "📍";
      if (m.type === "stay") {
        color = "#ec1f1fff";
        label = "🏨 숙소";
      } else if (m.type === "poi") {
        color = "#777";
        label = "✈️ 공항";
      } else if (m.type === "travel") {
        color = "#0088CC";
        label = "📍 여행지";
      }
      const pos = createMarker(m, idx, color, label);
      if (pos) path.push(pos);
    });

    /** ✅ 경로 라인 표시 */
    if (path.length > 1) {
      const polyline = new kakao.maps.Polyline({
        path,
        strokeWeight: 4,
        strokeColor: "#479fceff",
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      });
      polyline.setMap(map);
      lineRefs.current.push(polyline);
    }

    /** ✅ 지도 범위 자동 조정 */
    const bounds = new kakao.maps.LatLngBounds();
    path.forEach((p) => bounds.extend(p));
    requestAnimationFrame(() => {
      if (!bounds.isEmpty()) {
        map.relayout();
        map.setBounds(bounds);
      }
    });
  }, [isMapLoaded, markers]);

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
