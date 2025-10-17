import React, { useEffect, useRef } from "react";
import { useKakaoMap } from "@/common/hooks/useKakaoMap";

export default function TravelMap({ markers = [], step }) {
  const { isMapLoaded } = useKakaoMap("kakao-map-container");
  const mapRef = useRef(null);
  const containerId = "kakao-map-container";

  useEffect(() => {
    if (!isMapLoaded) return;
    const { kakao } = window;
    const container = document.getElementById(containerId);
    if (!container) return;

    // ✅ 맵 초기화 (최초 1회)
    if (!mapRef.current) {
      mapRef.current = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(33.36167, 126.52917),
        level: 10,
      });
    }

    const map = mapRef.current;

    /** ✅ 렐아웃 후 중심 보정 */
    const refreshMapLayout = () => {
      if (!container.offsetWidth || !container.offsetHeight) return;
      map.relayout();
      map.setCenter(new kakao.maps.LatLng(33.36167, 126.52917));
    };

    // ✅ 약간의 지연 후 재렌더링 (grid transition 이후)
    const timeout = setTimeout(refreshMapLayout, 500);

    // ✅ 창 리사이즈 대응
    window.addEventListener("resize", refreshMapLayout);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", refreshMapLayout);
    };
  }, [isMapLoaded, step]);

  return (
    <div
      id={containerId}
      style={{
        width: "100%",
        height: "calc(100vh - 100px)", // 헤더 높이 제외
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
