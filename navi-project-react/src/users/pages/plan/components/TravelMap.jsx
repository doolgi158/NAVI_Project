import React, { useEffect, useRef, useMemo } from "react";
import { useKakaoMap } from "../../../../common/hooks/useKakaoMap";

export default function TravelMap({ markers = [], step }) {
  const { isMapLoaded } = useKakaoMap("kakao-map-container");
  const mapRef = useRef(null);
  const markerRefs = useRef([]);
  const overlayRefs = useRef([]);
  const lineRefs = useRef([]);
  const containerId = "kakao-map-container";

  /** ✅ 중복 숙소 제거 + S1, S2 부여 */
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

    // 기존 마커/라인/오버레이 제거
    markerRefs.current.forEach((m) => m.setMap(null));
    overlayRefs.current.forEach((o) => o.setMap(null));
    lineRefs.current.forEach((l) => l.setMap(null));
    markerRefs.current = [];
    overlayRefs.current = [];
    lineRefs.current = [];

    if (!markers.length) return;

    /** ✅ 마커 생성 함수 (색상/번호 표시) */
    const createMarker = (m, idx, color, label) => {
      const lat = parseFloat(m.latitude);
      const lng = parseFloat(m.longitude);
      if (isNaN(lat) || isNaN(lng)) return null;

      const pos = new kakao.maps.LatLng(lat, lng);

      let markerHtml;
      if (m.type === "stay") {
        const stayNumber = m.stayOrder ?? idx + 1;
        markerHtml = `
      <div style="
        position: relative;
        width: 30px;
        height: 30px;
        background: ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 16 16" fill="white">
          <path d="M8 .5l6 6V15a1 1 0 0 1-1 1h-3v-4H6v4H3a1 1 0 0 1-1-1V6.5l6-6z"/>
        </svg>
        <div style="
          position: absolute;
          bottom: 9px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          font-weight: bold;
          color: ${color};
          background: white;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #eee;
        ">
          S${stayNumber}
        </div>
      </div>
    `;
      } else {
        // 기본 원형 마커
        markerHtml = `
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
       ${m.order ?? idx + 1}
     </div>`;
      }

      const marker = new kakao.maps.CustomOverlay({
        position: pos,
        content: markerHtml,
        yAnchor: 1,
      });
      marker.setMap(map);

      // Tooltip
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

    /** ✅ 일차별 그룹화 */
    const markersByDay = markers.reduce((acc, m) => {
      if (!acc[m.dayIdx]) acc[m.dayIdx] = [];
      acc[m.dayIdx].push(m);
      return acc;
    }, {});

    /** ✅ 일차별로 색상 반영하며 라인/마커 표시 */
    Object.keys(markersByDay).forEach((dayIdx) => {
      const group = markersByDay[dayIdx];
      const path = [];
      const color = group[0]?.color || "#2765b6ff";

      /** ✅ 타입별 색상 지정 */
      const getTypeColor = (type) => {
        switch (type) {
          case "stay":
            return "#EF476F"; // 붉은색 (숙소)
          case "travel":
            return "#0077B6"; // 파란색 (여행지)
          case "poi":
            return "#FFD166"; // 노란색 (공항, 포인트 등)
          default:
            return color;
        }
      };


      group.forEach((m, idx) => {
        const color = getTypeColor(m.type);
        let label = "";
        if (m.type === "stay") label = "🏨 숙소";
        else if (m.type === "poi") label = "✈️ 공항";
        else label = "📍 여행지";
        const pos = createMarker(m, idx, color, label);
        if (pos) path.push(pos);
      });

      if (path.length > 1) {
        const polyline = new kakao.maps.Polyline({
          path,
          strokeWeight: 4,
          strokeColor: color, // ✅ 라인은 일차별 기본색
          strokeOpacity: 0.9,
          strokeStyle: "solid",
        });
        polyline.setMap(map);
        lineRefs.current.push(polyline);
      }
    });

    /** ✅ 지도 범위 자동 조정 */
    const bounds = new kakao.maps.LatLngBounds();
    markers.forEach((m) => {
      const lat = parseFloat(m.latitude);
      const lng = parseFloat(m.longitude);
      if (!isNaN(lat) && !isNaN(lng)) bounds.extend(new kakao.maps.LatLng(lat, lng));
    });

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
        height: "calc(100vh )",
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
