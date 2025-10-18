import React, { useEffect, useRef, useMemo } from "react";
import { useKakaoMap } from "../../../../common/hooks/useKakaoMap";

export default function TravelMap({ markers = [], step }) {
  const { isMapLoaded } = useKakaoMap("kakao-map-container");
  const mapRef = useRef(null);
  const markerRefs = useRef([]);
  const overlayRefs = useRef([]);
  const travelLineRef = useRef(null);
  const containerId = "kakao-map-container";

  /** ✅ 중복된 숙소 제거 + 날짜순 정렬 + S1, S2 부여 */
  const processedStays = useMemo(() => {
    const stays = markers.filter((m) => m.type === "stay");
    if (!stays.length) return [];

    // 중복 제거 (같은 이름 1개만)
    const uniqueByName = stays.filter(
      (s, i, arr) => arr.findIndex((x) => x.name === s.name) === i
    );

    // 날짜 기준 정렬 (lat/lng이나 id 순서로는 보장 안되니까 name으로 단순 정렬)
    const sorted = uniqueByName.sort((a, b) => (a.name > b.name ? 1 : -1));

    // 번호 부여 (S1, S2, ...)
    return sorted.map((s, idx) => ({ ...s, stayOrder: idx + 1 }));
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
    const refreshMapLayout = () => {
      if (!container.offsetWidth || !container.offsetHeight) return;
      map.relayout();
      map.setCenter(new kakao.maps.LatLng(33.36167, 126.52917));
    };

    const timeout = setTimeout(refreshMapLayout, 500);
    window.addEventListener("resize", refreshMapLayout);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", refreshMapLayout);
    };
  }, [isMapLoaded, step]);

  /** ✅ 마커 및 툴팁 갱신 */
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    const { kakao } = window;
    const map = mapRef.current;

    // 기존 제거
    markerRefs.current.forEach((m) => m.setMap(null));
    markerRefs.current = [];
    overlayRefs.current.forEach((o) => o.setMap(null));
    overlayRefs.current = [];
    if (travelLineRef.current) {
      travelLineRef.current.setMap(null);
      travelLineRef.current = null;
    }

    if (!markers.length) return;

    const travelMarkers = markers.filter((m) => m.type === "travel");
    const travelPath = [];

    /** 🟣 여행지 마커 (보라색 + 번호 + hover 이름) */
    travelMarkers.forEach((m, idx) => {
      const pos = new kakao.maps.LatLng(m.lat, m.lng);
      const markerHtml = `
        <div style="
          background:#6846FF;
          color:white;
          font-weight:bold;
          border-radius:50%;
          width:32px;height:32px;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);
          border:2px solid white;
          cursor:pointer;
        ">${idx + 1}</div>
      `;
      const marker = new kakao.maps.CustomOverlay({
        position: pos,
        content: markerHtml,
        yAnchor: 1,
      });
      marker.setMap(map);
      markerRefs.current.push(marker);
      travelPath.push(pos);

      // hover 시 이름 툴팁
      const tooltip = new kakao.maps.CustomOverlay({
        position: pos,
        content: `
          <div style="
            background:white;
            border-radius:8px;
            padding:4px 8px;
            font-size:13px;
            font-weight:600;
            color:#333;
            box-shadow:0 2px 6px rgba(0,0,0,0.15);
            white-space:nowrap;
            border:1px solid #ddd;
          ">📍 ${m.name}</div>
        `,
        yAnchor: 1.8,
      });

      const markerEl = marker.a || marker.content;
      if (markerEl) {
        markerEl.addEventListener("mouseenter", () => tooltip.setMap(map));
        markerEl.addEventListener("mouseleave", () => tooltip.setMap(null));
      }
      overlayRefs.current.push(tooltip);
    });

    /** 🔴 숙소 마커 (빨간색 + S1, S2 + hover 이름) */
    processedStays.forEach((m) => {
      const pos = new kakao.maps.LatLng(m.lat, m.lng);
      const markerHtml = `
        <div style="
          background:#E53935;
          color:white;
          font-weight:bold;
          border-radius:50%;
          width:30px;height:30px;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);
          border:2px solid white;
          cursor:pointer;
        ">S${m.stayOrder}</div>
      `;
      const marker = new kakao.maps.CustomOverlay({
        position: pos,
        content: markerHtml,
        yAnchor: 1,
      });
      marker.setMap(map);
      markerRefs.current.push(marker);

      const tooltip = new kakao.maps.CustomOverlay({
        position: pos,
        content: `
          <div style="
            background:white;
            border-radius:8px;
            padding:4px 8px;
            font-size:13px;
            font-weight:600;
            color:#E53935;
            box-shadow:0 2px 6px rgba(0,0,0,0.15);
            white-space:nowrap;
            border:1px solid #f1b6b6;
          ">🏨 ${m.name}</div>
        `,
        yAnchor: 1.8,
      });

      const markerEl = marker.a || marker.content;
      if (markerEl) {
        markerEl.addEventListener("mouseenter", () => tooltip.setMap(map));
        markerEl.addEventListener("mouseleave", () => tooltip.setMap(null));
      }
      overlayRefs.current.push(tooltip);
    });

    /** 🟣 여행지들만 선 연결 */
    if (travelPath.length > 1) {
      const polyline = new kakao.maps.Polyline({
        path: travelPath,
        strokeWeight: 5,
        strokeColor: "#6846FF",
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      });
      polyline.setMap(map);
      travelLineRef.current = polyline;
    }

    /** 📍 모든 마커 포함하도록 범위 조정 */
    const bounds = new kakao.maps.LatLngBounds();
    [...travelPath, ...processedStays.map((s) => new kakao.maps.LatLng(s.lat, s.lng))].forEach((p) =>
      bounds.extend(p)
    );
    map.setBounds(bounds);

    return () => {
      markerRefs.current.forEach((m) => m.setMap(null));
      overlayRefs.current.forEach((o) => o.setMap(null));
      if (travelLineRef.current) travelLineRef.current.setMap(null);
    };
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
