import MainLayout from "../../layout/MainLayout";
import { useState, useEffect, useRef } from "react";
import {
  Input,
  DatePicker,
  Button,
  message,
  Radio,
  Card,
  Divider,
  Typography,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setReserveData } from "../../../common/slice/paymentSlice";
import { useDispatch } from "react-redux";

const token = localStorage.getItem("accessToken");
const { Title, Text } = Typography;

const API_SERVER_HOST = "http://localhost:8080";
const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
const BAG_PRICE_TABLE = { S: 10000, M: 15000, L: 20000 };
const JEJU_AIRPORT = { lat: 33.5055, lng: 126.495 };

const DeliveryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    senderName: "",
    phone: "",
    deliveryType: "AIRPORT_TO_HOTEL",
    fromAddress: "",
    toAddress: "",
    deliveryDate: null,
    memo: "",
  });
  const [bags, setBags] = useState({ S: 0, M: 0, L: 0 });
  const [estimatedFare, setEstimatedFare] = useState(0);

  const MAP_CONTAINER_ID = "delivery-map";
  const mapRef = useRef(null);
  const markersRef = useRef({ fromAddress: null, toAddress: null });
  const lineRef = useRef(null);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleNameChange = (value) => {
    const filtered = value.replace(/[^a-zA-Z가-힣\s]/g, "");
    setForm((p) => ({ ...p, senderName: filtered }));
  };

  const handlePhoneChange = (value) => {
    if (!value.startsWith("010-")) {
      value = "010-" + value.replace(/[^0-9]/g, "").replace(/^010/, "");
    }
    let digits = value.replace(/[^0-9]/g, "").slice(3);
    let formatted = "010-";
    if (digits.length <= 4) formatted += digits;
    else formatted += `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
    setForm((p) => ({ ...p, phone: formatted }));
  };

  const handleBagChange = (size, count) => {
    setBags((prev) => ({ ...prev, [size]: Math.max(0, Number(count)) }));
  };

  /** ✅ 총 요금 자동 계산 */
  useEffect(() => {
    const total =
      bags.S * BAG_PRICE_TABLE.S +
      bags.M * BAG_PRICE_TABLE.M +
      bags.L * BAG_PRICE_TABLE.L;
    setEstimatedFare(total);
  }, [bags]);

  /** ✅ 지도 초기화 */
  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => initMap());
      } else {
        const script = document.createElement("script");
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services`;
        script.async = true;
        script.onload = () => window.kakao.maps.load(() => initMap());
        document.head.appendChild(script);
      }
    };

    const initMap = () => {
      const container = document.getElementById(MAP_CONTAINER_ID);
      if (!container) return;
      const kakao = window.kakao;
      mapRef.current = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(JEJU_AIRPORT.lat, JEJU_AIRPORT.lng),
        level: 5,
      });
    };

    loadKakaoMap();
  }, []);

  /** ✅ 공항 마커 자동 생성 */
  const setAirportMarker = (targetKey) => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    if (markersRef.current.fromAddress)
      markersRef.current.fromAddress.setMap(null);
    if (markersRef.current.toAddress)
      markersRef.current.toAddress.setMap(null);

    const position = new kakao.maps.LatLng(JEJU_AIRPORT.lat, JEJU_AIRPORT.lng);
    const marker = new kakao.maps.Marker({ position, map: mapRef.current });

    mapRef.current.setCenter(position);
    mapRef.current.setLevel(5);

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(
      JEJU_AIRPORT.lng,
      JEJU_AIRPORT.lat,
      (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          const roadAddr = result[0].road_address
            ? result[0].road_address.address_name
            : result[0].address.address_name;
          setForm((prev) => ({
            ...prev,
            [targetKey]: `${roadAddr} (제주국제공항)`,
          }));
        }
      }
    );

    return marker;
  };

  /** ✅ 기본 상태 세팅 (공항→숙소) */
  useEffect(() => {
    setForm((p) => ({ ...p, deliveryType: "AIRPORT_TO_HOTEL" }));
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
        setForm((p) => ({ ...p, [targetKey]: addr }));

        const { kakao } = window;
        if (!kakao?.maps?.services) {
          message.error("지도 API가 아직 준비되지 않았습니다.");
          return;
        }

        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(addr, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const lat = parseFloat(result[0].y);
            const lng = parseFloat(result[0].x);
            const pos = new kakao.maps.LatLng(lat, lng);
            if (!mapRef.current) return;

            if (markersRef.current[targetKey])
              markersRef.current[targetKey].setMap(null);

            const marker = new kakao.maps.Marker({
              position: pos,
              map: mapRef.current,
            });
            markersRef.current[targetKey] = marker;

            const { fromAddress, toAddress } = markersRef.current;
            if (fromAddress && toAddress) {
              if (lineRef.current) lineRef.current.setMap(null);
              const path = [fromAddress.getPosition(), toAddress.getPosition()];
              const poly = new kakao.maps.Polyline({
                path,
                strokeWeight: 3,
                strokeColor: "#2F80ED",
                strokeOpacity: 0.8,
              });
              poly.setMap(mapRef.current);
              lineRef.current = poly;

              const bounds = new kakao.maps.LatLngBounds();
              bounds.extend(path[0]);
              bounds.extend(path[1]);
              mapRef.current.setBounds(bounds, 50);
            } else {
              mapRef.current.setCenter(pos);
            }
          }
        });
      },
    }).open();
  };

  /** ✅ 예약 처리 */
  const handleSubmit = async () => {
    const required = ["senderName", "phone", "fromAddress", "toAddress", "deliveryDate"];
    const missing = required.find((k) => !form[k]);
    if (missing) return message.warning("모든 정보를 입력해주세요.");

    const totalBags = bags.S + bags.M + bags.L;
    if (totalBags === 0) return message.warning("가방 개수를 1개 이상 입력해주세요.");

    const dto = {
      startAddr: form.fromAddress,
      endAddr: form.toAddress,
      deliveryDate: form.deliveryDate.format("YYYY-MM-DD"),
      totalPrice: estimatedFare,
      bags,
      memo: form.memo,
      phone: form.phone,
    };

    try {
      const res = await axios.post(`${API_SERVER_HOST}/api/delivery/rsv`, dto, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch(
        setReserveData({
          rsvType: "DLV",
          reserveId: res.data.data.drsvId,
          itemData: res.data.data,
        })
      );

      message.success("짐배송 예약이 완료되었습니다!");
      navigate("/payment", {
        state: {
          rsvType: "DLV",
          items: res.data.data,
          formData: form,
          totalPrice: totalBags,
        },
      });
    } catch (error) {
      console.error("❌ [DeliveryPage] 예약 요청 실패:", error);
      message.error("예약 중 오류가 발생했습니다.");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto mt-12 pb-24 grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-0">
        {/* ✅ 왼쪽 입력폼 */}
        <Card className="shadow-md rounded-2xl border border-gray-200" styles={{ body: { padding: "28px 32px" } }}>
          <Title level={3} className="text-center mb-6 text-blue-600">
            짐배송 예약
          </Title>

          {/* 이름/전화번호 */}
          <Input placeholder="이름" value={form.senderName} onChange={(e) => handleNameChange(e.target.value)} className="mb-3" />
          <Input placeholder="전화번호 (010-1234-5678)" value={form.phone} onChange={(e) => handlePhoneChange(e.target.value)} className="mb-5" maxLength={13} />

          {/* ✅ 배송 방향 선택 */}
          <Text strong>배송 방향</Text>
          <Radio.Group
            value={form.deliveryType}
            onChange={(e) => {
              const v = e.target.value;
              handleChange("deliveryType", v);
              setForm((p) => ({ ...p, fromAddress: "", toAddress: "" }));

              if (v === "AIRPORT_TO_HOTEL") {
                const m = setAirportMarker("fromAddress");
                markersRef.current.fromAddress = m;
              } else if (v === "HOTEL_TO_AIRPORT") {
                const m = setAirportMarker("toAddress");
                markersRef.current.toAddress = m;
              } else {
                Object.values(markersRef.current).forEach((m) => m?.setMap(null));
                markersRef.current = { fromAddress: null, toAddress: null };
                mapRef.current.setCenter(new window.kakao.maps.LatLng(JEJU_AIRPORT.lat, JEJU_AIRPORT.lng));
              }
            }}
            optionType="button"
            buttonStyle="solid"
            className="w-full flex justify-between my-3"
          >
            <Radio.Button value="AIRPORT_TO_HOTEL" className="flex-1 text-center">공항 → 숙소</Radio.Button>
            <Radio.Button value="HOTEL_TO_AIRPORT" className="flex-1 text-center">숙소 → 공항</Radio.Button>
            <Radio.Button value="HOTEL_TO_HOTEL" className="flex-1 text-center">숙소 ↔ 숙소</Radio.Button>
          </Radio.Group>

          <Divider />

          {/* ✅ 주소 입력 */}
          <div className="flex gap-2 mb-3">
            <Input placeholder="출발지 주소" value={form.fromAddress} onChange={(e) => handleChange("fromAddress", e.target.value)} />
            <Button onClick={() => handleSearchAddress("fromAddress")}>주소 찾기</Button>
          </div>
          <div className="flex gap-2 mb-4">
            <Input placeholder="도착지 주소" value={form.toAddress} onChange={(e) => handleChange("toAddress", e.target.value)} />
            <Button onClick={() => handleSearchAddress("toAddress")}>주소 찾기</Button>
          </div>

          {/* ✅ 날짜 선택 */}
          <DatePicker
            className="w-full mb-4"
            value={form.deliveryDate ? dayjs(form.deliveryDate) : null}
            onChange={(date) => handleChange("deliveryDate", date)}
            placeholder="배송 희망 일자 선택"
            disabledDate={(current) => current && current < dayjs().endOf("day")}
          />

          {/* ✅ 가방 입력 */}
          <Text strong>가방 정보</Text>
          <div className="grid grid-cols-3 gap-3 mt-3 mb-4">
            {["S", "M", "L"].map((size) => (
              <div key={size} className="flex flex-col items-center border rounded-lg p-2">
                <Text className="font-semibold">{size}</Text>
                <Text type="secondary">{BAG_PRICE_TABLE[size].toLocaleString()}원</Text>
                <input
                  type="number"
                  min="0"
                  className="border rounded-md p-1 mt-2 w-16 text-center"
                  value={bags[size]}
                  onChange={(e) => handleBagChange(size, e.target.value)}
                />
              </div>
            ))}
          </div>

          <textarea
            className="border rounded-md p-2 w-full mb-4"
            placeholder="요청사항 (선택)"
            rows="2"
            value={form.memo}
            onChange={(e) => handleChange("memo", e.target.value)}
          />

          {estimatedFare > 0 && (
            <div className="bg-blue-50 text-blue-700 rounded-lg text-center p-3 mb-4">
              <strong>예상 요금:</strong> {estimatedFare.toLocaleString()}원
            </div>
          )}

          <Button type="primary" block size="large" className="h-12 text-base font-semibold" onClick={handleSubmit}>
            예약하기
          </Button>
        </Card>

        {/* ✅ 지도 */}
        <Card className="shadow-md rounded-2xl border border-gray-200 overflow-hidden" styles={{ body: { padding: 0 } }}>
          <div id={MAP_CONTAINER_ID} style={{ width: "100%", height: "calc(70vh - 2px)" }}></div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DeliveryPage;
