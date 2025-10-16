import React, { useEffect, useRef } from "react";
import { useKakaoMap } from "@/common/hooks/useKakaoMap";

export default function TravelMap({ markers }) {
  const MAP_ID = "travel-map";
  const { isMapLoaded } = useKakaoMap(MAP_ID);
  const mapRef = useRef(null);
  const markerRefs = useRef([]);
  const overlayRefs = useRef([]);
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!isMapLoaded) return;
    const { kakao } = window;
    const container = document.getElementById(MAP_ID);
    if (!container) return;

    if (!mapRef.current)
      mapRef.current = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(33.3895, 126.53),
        level: 9,
      });

    const map = mapRef.current;
    markerRefs.current.forEach((m) => m.setMap(null));
    overlayRefs.current.forEach((o) => o.setMap(null));
    if (polylineRef.current) polylineRef.current.setMap(null);

    const travelColor = "#3578E5";
    const stayColor = "#E53935";
    const lineColor = "#4C8BF5";
    const linePath = [];

    markers.forEach((m, i) => {
      const pos = new kakao.maps.LatLng(m.lat, m.lng);
      const marker = new kakao.maps.Marker({ position: pos, map });
      markerRefs.current.push(marker);

      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        map,
        yAnchor: 1.1,
        content:
          m.type === "travel"
            ? `<div style="background:${travelColor};color:white;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-weight:bold;">${i + 1}</div>`
            : `<div style="background:${stayColor};color:white;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-weight:bold;">S</div>`,
      });
      overlayRefs.current.push(overlay);
      if (m.type === "travel") linePath.push(pos);
    });

    if (linePath.length > 1) {
      const polyline = new kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 4,
        strokeColor: lineColor,
        strokeOpacity: 0.9,
      });
      polyline.setMap(map);
      polylineRef.current = polyline;
    }
  }, [isMapLoaded, markers]);

  return (
    <div
      id={MAP_ID}
      style={{ width: "100%", height: "100%", background: "#F8FAFC" }}
    >
      {!isMapLoaded && (
        <div className="flex items-center justify-center h-full text-gray-400">
          카카오맵 로딩 중...
        </div>
      )}
    </div>
  );
}
