// src/users/pages/delivery/DeliveryPage.jsx
import MainLayout from "../../layout/MainLayout";
import { useState, useEffect, useRef } from "react";
import { Input, DatePicker, Button, message, Radio } from "antd";
import dayjs from "dayjs";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_SERVER_HOST = "http://localhost:8080";

// ✅ bagSize별 요금표
const BAG_PRICE_TABLE = {
  S: 10000,
  M: 15000,
  L: 20000,
};

// ✅ 제주공항 좌표
const JEJU_AIRPORT = { lat: 33.5055, lng: 126.495 };

const DeliveryPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    senderName: "",
    phone: "",
    deliveryType: "AIRPORT_TO_HOTEL", // ✅ 기본값 공항 → 숙소
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

  /** ✅ 지도 초기화 */
  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => initMap());
      } else {
        const script = document.createElement("script");
        script.src =
          "//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&autoload=false&libraries=services";
        script.async = true;
        script.onload = () => {
          window.kakao.maps.load(() => initMap());
        };
        document.head.appendChild(script);
      }
    };

    const initMap = () => {
      const container = document.getElementById(MAP_CONTAINER_ID);
      if (!container) return;
      const kakao = window.kakao;

      mapRef.current = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(JEJU_AIRPORT.lat, JEJU_AIRPORT.lng),
        level: 5, // ✅ 초기 확대값
      });
    };

    loadKakaoMap();
  }, []);

  /** ✅ 공항 마커 생성 + 실제 도로명 주소 자동 입력 */
  const setAirportMarker = (targetKey) => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    if (markersRef.current.fromAddress)
      markersRef.current.fromAddress.setMap(null);
    if (markersRef.current.toAddress)
      markersRef.current.toAddress.setMap(null);

    const position = new kakao.maps.LatLng(JEJU_AIRPORT.lat, JEJU_AIRPORT.lng);
    const marker = new kakao.maps.Marker({
      position,
      map: mapRef.current,
    });

    mapRef.current.setCenter(position);
    mapRef.current.setLevel(5);

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(JEJU_AIRPORT.lng, JEJU_AIRPORT.lat, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const roadAddr = result[0].road_address
          ? result[0].road_address.address_name
          : result[0].address.address_name;

        setForm((prev) => ({
          ...prev,
          [targetKey]: `${roadAddr} (제주국제공항)`,
        }));
      }
    });

    return marker;
  };

  /** ✅ 페이지 진입 시 공항 → 숙소 자동 세팅 */
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      deliveryType: "AIRPORT_TO_HOTEL",
    }));

    const timer = setTimeout(() => {
      if (window.kakao && window.kakao.maps && mapRef.current) {
        const marker = setAirportMarker("fromAddress");
        markersRef.current.fromAddress = marker;
      }
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  /** ✅ 주소 검색 */
  const handleSearchAddress = (targetKey) => {
    if (!window.daum || !window.daum.Postcode) {
      const script = document.createElement("script");
      script.src =
        "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
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

            if (!mapRef.current) return;

            if (markersRef.current[targetKey])
              markersRef.current[targetKey].setMap(null);

            const marker = new kakao.maps.Marker({
              position,
              map: mapRef.current,
            });
            markersRef.current[targetKey] = marker;

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

              const bounds = new kakao.maps.LatLngBounds();
              bounds.extend(linePath[0]);
              bounds.extend(linePath[1]);
              mapRef.current.setBounds(bounds, 50);

            } else {
              mapRef.current.setCenter(position);
            }
          }
        });
      },
    }).open();
  };

  /** ✅ 예약 요청 (결과 페이지 이동 포함) */
  const handleSubmit = async () => {
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
      message.warning("모든 정보를 입력해주세요.");
      return;
    }

    const dto = {
      startAddr: form.fromAddress,
      endAddr: form.toAddress,
      deliveryDate: form.deliveryDate.format("YYYY-MM-DD"),
      totalPrice: estimatedFare,
      userNo: 2, // TODO: 로그인 세션에서 추출 예정
      bagId: form.bagSize === "S" ? 1 : form.bagSize === "M" ? 2 : 3,
      groupId: "G20251015_JEJU_AM_1",
    };

    try {
      const res = await axios.post(`${API_SERVER_HOST}/api/delivery/rsv`, dto);
      message.success("짐배송 예약이 완료되었습니다!");
      navigate("/delivery/result", { state: res.data }); // 결과 페이지로 이동
    } catch (error) {
      console.error("❌ 예약 요청 실패:", error);
      message.error("예약 중 오류가 발생했습니다.");
    }
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

          {/* ✅ 배송 방향 선택 */}
          <h3 className="font-semibold mb-2">배송 방향</h3>
          <Radio.Group
            value={form.deliveryType}
            onChange={(e) => {
              const value = e.target.value;
              handleChange("deliveryType", value);
              setForm((prev) => ({ ...prev, fromAddress: "", toAddress: "" }));

              if (value === "AIRPORT_TO_HOTEL") {
                const marker = setAirportMarker("fromAddress");
                markersRef.current.fromAddress = marker;
              } else if (value === "HOTEL_TO_AIRPORT") {
                const marker = setAirportMarker("toAddress");
                markersRef.current.toAddress = marker;
              } else {
                if (markersRef.current.fromAddress)
                  markersRef.current.fromAddress.setMap(null);
                if (markersRef.current.toAddress)
                  markersRef.current.toAddress.setMap(null);
                markersRef.current = { fromAddress: null, toAddress: null };
                mapRef.current.setCenter(
                  new window.kakao.maps.LatLng(JEJU_AIRPORT.lat, JEJU_AIRPORT.lng)
                );
                mapRef.current.setLevel(5);
              }
            }}
            optionType="button"
            buttonStyle="solid"
            className="w-full mb-4 flex justify-between"
          >
            <Radio.Button value="AIRPORT_TO_HOTEL" className="flex-1 text-center">
              공항 → 숙소
            </Radio.Button>
            <Radio.Button value="HOTEL_TO_AIRPORT" className="flex-1 text-center">
              숙소 → 공항
            </Radio.Button>
            <Radio.Button value="HOTEL_TO_HOTEL" className="flex-1 text-center">
              숙소 ↔ 숙소
            </Radio.Button>
          </Radio.Group>

          {/* 주소 입력 */}
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
