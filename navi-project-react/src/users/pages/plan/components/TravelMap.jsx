import React, { useEffect, useRef } from "react";
import { useKakaoMap } from "@/common/hooks/useKakaoMap";

export default function TravelMap({ markers = [], step }) {
  const { isMapLoaded } = useKakaoMap("kakao-map-container");
  const mapRef = useRef(null);
  const containerId = "kakao-map-container";
  const level=10;

  useEffect(() => {
    if (!isMapLoaded) return;
    const { kakao } = window;
    const container = document.getElementById(containerId);
    if (!container) return;

    // ✅ 최초 맵 초기화
    if (!mapRef.current) {
      mapRef.current = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(33.36167, 126.52917),
        level: level,
      });
    }

    const map = mapRef.current;

    // ✅ 지도 영역 리사이즈될 때 깨짐 방지
    setTimeout(() => {
      map.relayout(); // 💥 핵심: container 크기 재계산
      // 중심 재설정
      const currentCenter = map.getCenter();
      map.setCenter(currentCenter);
    }, 400); // transition 시간(0.3~0.6s)에 맞게 약간 딜레이

  }, [isMapLoaded, step]); // ✅ step이 바뀔 때마다 실행

  return (
    <div
      id={containerId}
      style={{
        width: "100%",
        height: "100%",
        background: "#F8FAFC",
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
