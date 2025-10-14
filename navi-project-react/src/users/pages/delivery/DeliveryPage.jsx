import MainLayout from "../../layout/MainLayout";
import { useState, useEffect, useRef } from "react";
import { Input, DatePicker, Button, message } from "antd";
import dayjs from "dayjs";

// ✅ bagSize별 요금표
const BAG_PRICE_TABLE = {
  S: 10000,
  M: 15000,
  L: 20000,
};

const DeliveryPage = () => {
  const [form, setForm] = useState({
    senderName: "",
    phone: "",
    deliveryType: "AIRPORT_TO_HOTEL",
    fromAddress: "",
    toAddress: "",
    deliveryDate: null,
    bagSize: "",
    bagCount: 1,
    memo: "",
  });

  const [estimatedFare, setEstimatedFare] = useState(null);
  const MAP_CONTAINER_ID = "delivery-map";
  const mapRef = useRef(null);
  const markersRef = useRef({ fromAddress: null, toAddress: null });
  const lineRef = useRef(null);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /** ✅ 가방 크기 기반 요금 자동 계산 */
  useEffect(() => {
    const { bagSize, bagCount } = form;
    if (bagSize && bagCount) {
      const basePrice = BAG_PRICE_TABLE[bagSize] || 0;
      const total = basePrice * Number(bagCount);
      setEstimatedFare(total);
    } else {
      setEstimatedFare(null);
    }
  }, [form.bagSize, form.bagCount]);

  /** 지도 SDK 완전 로드 후 초기화 */
  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        // SDK가 이미 로드되어 있다면
        window.kakao.maps.load(() => {
          initMap();
        });
      } else {
        // SDK 동적 로드
        const script = document.createElement("script");
        script.src =
          "//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&autoload=false&libraries=services";
        script.async = true;
        script.onload = () => {
          window.kakao.maps.load(() => {
            initMap();
          });
        };
        document.head.appendChild(script);
      }
    };

    const initMap = () => {
      const container = document.getElementById(MAP_CONTAINER_ID);
      if (!container) return;

      const kakao = window.kakao;
      mapRef.current = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(33.5055, 126.495),
        level: 6,
      });
    };

    loadKakaoMap();
  }, []);

  /** 카카오 주소 검색 */
  const handleSearchAddress = (targetKey) => {
    // 주소 검색 SDK가 안 불러와졌다면 로드
    if (!window.daum || !window.daum.Postcode) {
      const script = document.createElement("script");
      script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      script.onload = () => handleSearchAddress(targetKey);
      document.head.appendChild(script);
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data) {
        const addr = data.address;
        setForm((prev) => ({ ...prev, [targetKey]: addr }));

        const { kakao } = window;
        if (!kakao || !kakao.maps || !kakao.maps.services) {
          message.error("지도 API가 아직 준비되지 않았습니다.");
          return;
        }

        const geocoder = new kakao.maps.services.Geocoder();

        geocoder.addressSearch(addr, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const lat = parseFloat(result[0].y);
            const lng = parseFloat(result[0].x);
            const position = new kakao.maps.LatLng(lat, lng);

            if (!mapRef.current) {
              const container = document.getElementById(MAP_CONTAINER_ID);
              mapRef.current = new kakao.maps.Map(container, {
                center: position,
                level: 6,
              });
            }

            // 기존 마커 제거
            if (markersRef.current[targetKey])
              markersRef.current[targetKey].setMap(null);

            const marker = new kakao.maps.Marker({
              position,
              map: mapRef.current,
            });
            markersRef.current[targetKey] = marker;

            // 출발지-도착지 연결선
            const fromMarker = markersRef.current.fromAddress;
            const toMarker = markersRef.current.toAddress;

            if (fromMarker && toMarker) {
              if (lineRef.current) lineRef.current.setMap(null);
              const linePath = [
                fromMarker.getPosition(),
                toMarker.getPosition(),
              ];
              const polyline = new kakao.maps.Polyline({
                path: linePath,
                strokeWeight: 3,
                strokeColor: "#2F80ED",
                strokeOpacity: 0.8,
              });
              polyline.setMap(mapRef.current);
              lineRef.current = polyline;

              // 지도 범위 자동 맞춤
              const bounds = new kakao.maps.LatLngBounds();
              bounds.extend(linePath[0]);
              bounds.extend(linePath[1]);
              mapRef.current.setBounds(bounds);
            } else {
              mapRef.current.setCenter(position);
            }
          }
        });
      },
    }).open();
  };

  /** 예약 요청 */
  const handleSubmit = () => {
    const required = [
      "senderName",
      "phone",
      "fromAddress",
      "toAddress",
      "deliveryDate",
      "bagSize",
      "bagCount",
    ];
    const missing = required.find((k) => !form[k]);
    if (missing) {
      message.warning("모든 필드를 입력해주세요.");
      return;
    }

    const payload = {
      ...form,
      estimatedFare,
    };

    console.log("📦 예약 요청 데이터:", payload);
    message.success("예약 요청이 완료되었습니다!");
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 왼쪽 입력폼 */}
        <div className="p-6 bg-white rounded-2xl shadow-md">
          <h2 className="text-xl font-bold text-center mb-6">짐배송 예약</h2>

          <Input
            placeholder="이름"
            value={form.senderName}
            onChange={(e) => handleChange("senderName", e.target.value)}
            className="mb-3"
          />
          <Input
            placeholder="전화번호"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="mb-3"
          />

          {/* 배송 방향 */}
          <h3 className="font-semibold mb-2">배송 방향</h3>
          <div className="flex gap-4 mb-4">
            <label>
              <input
                type="radio"
                name="deliveryType"
                value="AIRPORT_TO_HOTEL"
                checked={form.deliveryType === "AIRPORT_TO_HOTEL"}
                onChange={(e) => handleChange("deliveryType", e.target.value)}
              />{" "}
              공항 → 숙소
            </label>
            <label>
              <input
                type="radio"
                name="deliveryType"
                value="HOTEL_TO_AIRPORT"
                checked={form.deliveryType === "HOTEL_TO_AIRPORT"}
                onChange={(e) => handleChange("deliveryType", e.target.value)}
              />{" "}
              숙소 → 공항
            </label>
          </div>

          {/* 출발지 / 도착지 */}
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="출발지 주소"
              value={form.fromAddress}
              onChange={(e) => handleChange("fromAddress", e.target.value)}
            />
            <Button onClick={() => handleSearchAddress("fromAddress")}>
              주소 찾기
            </Button>
          </div>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="도착지 주소"
              value={form.toAddress}
              onChange={(e) => handleChange("toAddress", e.target.value)}
            />
            <Button onClick={() => handleSearchAddress("toAddress")}>
              주소 찾기
            </Button>
          </div>

          <DatePicker
            className="w-full mb-4"
            value={form.deliveryDate ? dayjs(form.deliveryDate) : null}
            onChange={(date) => handleChange("deliveryDate", date)}
            placeholder="배송 희망 일자"
          />

          {/* 가방 정보 */}
          <h3 className="font-semibold text-gray-700 mt-4 mb-2">가방 정보</h3>
          <div className="flex gap-3 mb-3">
            <select
              className="border rounded-md p-2 w-1/2"
              value={form.bagSize}
              onChange={(e) => handleChange("bagSize", e.target.value)}
            >
              <option value="">가방 크기 선택</option>
              <option value="S">소형 (S)</option>
              <option value="M">중형 (M)</option>
              <option value="L">대형 (L)</option>
            </select>

            <input
              type="number"
              min="1"
              className="border rounded-md p-2 w-1/2"
              placeholder="가방 개수"
              value={form.bagCount}
              onChange={(e) => handleChange("bagCount", e.target.value)}
            />
          </div>

          <textarea
            className="border rounded-md p-2 w-full mb-4"
            placeholder="요청사항 (선택)"
            rows="2"
            value={form.memo}
            onChange={(e) => handleChange("memo", e.target.value)}
          />

          {/* 예상 요금 표시 */}
          {estimatedFare && (
            <div className="text-center text-lg font-semibold text-blue-600 mb-4">
              예상 요금: {estimatedFare.toLocaleString()}원
            </div>
          )}

          <Button type="primary" block onClick={handleSubmit}>
            예약하기
          </Button>
        </div>

        {/* 지도 */}
        <div className="bg-gray-100 rounded-2xl overflow-hidden">
          <div
            id={MAP_CONTAINER_ID}
            style={{ width: "100%", height: "650px", borderRadius: "12px" }}
          ></div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DeliveryPage;
