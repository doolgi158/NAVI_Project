import MainLayout from "../../layout/MainLayout";
import { useState, useEffect, useRef } from "react";
import {
  Input,
  DatePicker,
  Button,
  message,
  Radio,
  Card,
  Typography,
  Row,
  Col,
  Modal,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
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
    timeSlot: "",
    memo: "",
  });
  const [bags, setBags] = useState({ S: 0, M: 0, L: 0 });
  const [estimatedFare, setEstimatedFare] = useState(0);
  const [isMapReady, setIsMapReady] = useState(false);

  const MAP_CONTAINER_ID = "delivery-map";
  const mapRef = useRef(null);
  const markersRef = useRef({ fromAddress: null, toAddress: null });
  const lineRef = useRef(null);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleNameChange = (value) => {
    const filtered = value.replace(/[0-9!@#\$%\^\&*\)\(+=._-]/g, "");
    setForm((prev) => ({ ...prev, senderName: filtered }));
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

  useEffect(() => {
    const total =
      bags.S * BAG_PRICE_TABLE.S +
      bags.M * BAG_PRICE_TABLE.M +
      bags.L * BAG_PRICE_TABLE.L;
    setEstimatedFare(total);
  }, [bags]);

  /** ✅ 지도 준비 완료 후 기본 공항 주소 자동 세팅 */
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    if (form.deliveryType === "AIRPORT_TO_HOTEL" && !form.fromAddress) {
      const marker = setAirportMarker("fromAddress");
      markersRef.current.fromAddress = marker;
    } else if (form.deliveryType === "HOTEL_TO_AIRPORT" && !form.toAddress) {
      const marker = setAirportMarker("toAddress");
      markersRef.current.toAddress = marker;
    }
  }, [isMapReady, form.deliveryType]);

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
      setIsMapReady(true);
    };

    loadKakaoMap();
  }, []);

  /** ✅ 공항 마커 자동 생성 */
  const setAirportMarker = (targetKey) => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    Object.values(markersRef.current).forEach((m) => m?.setMap(null));

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
        if (!kakao?.maps?.services) return;

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
              mapRef.current.setBounds(bounds, 80);
            } else {
              mapRef.current.setCenter(pos);
            }
          }
        });
      },
    }).open();
  };

  /** ✅ 배송 타입 변경 */
  const handleDeliveryTypeChange = (v) => {
    handleChange("deliveryType", v);
    setForm((p) => ({ ...p, fromAddress: "", toAddress: "" }));

    if (!isMapReady || !mapRef.current) return;

    if (v === "AIRPORT_TO_HOTEL") {
      const m = setAirportMarker("fromAddress");
      markersRef.current.fromAddress = m;
    } else if (v === "HOTEL_TO_AIRPORT") {
      const m = setAirportMarker("toAddress");
      markersRef.current.toAddress = m;
    } else {
      Object.values(markersRef.current).forEach((m) => m?.setMap(null));
      markersRef.current = { fromAddress: null, toAddress: null };
      mapRef.current.setCenter(
        new window.kakao.maps.LatLng(JEJU_AIRPORT.lat, JEJU_AIRPORT.lng)
      );
    }
  };

  /** ✅ 예약 전 확인 모달 */
  const showConfirmModal = () => {
    const required = [
      "senderName",
      "phone",
      "fromAddress",
      "toAddress",
      "deliveryDate",
    ];
    const missing = required.find((k) => !form[k]);
    if (missing) return message.warning("모든 정보를 입력해주세요.");

    const totalBags = bags.S + bags.M + bags.L;
    if (totalBags === 0)
      return message.warning("가방 개수를 1개 이상 입력해주세요.");

    Modal.confirm({
      title: "예약 정보 확인",
      centered: true,
      width: 420,
      content: (
        <div style={{ lineHeight: 1.8 }}>
          <p><b>이름:</b> {form.senderName}</p>
          <p><b>전화번호:</b> {form.phone}</p>
          <p><b>출발지:</b> {form.fromAddress}</p>
          <p><b>도착지:</b> {form.toAddress}</p>
          <p><b>날짜:</b> {form.deliveryDate?.format("YYYY-MM-DD")}</p>
          <p><b>시간대:</b> {form.timeSlot || "미선택"}</p>
          <p><b>가방:</b> S({bags.S}) / M({bags.M}) / L({bags.L})</p>
          <p><b>예상 요금:</b> {estimatedFare.toLocaleString()}원</p>
          {form.memo && <p><b>요청사항:</b> {form.memo}</p>}
        </div>
      ),
      okText: "확인",
      cancelText: "취소",
      onOk: handleSubmit,
    });
  };

  /** ✅ 예약 처리 */
  const handleSubmit = async () => {
    const required = [
      "senderName",
      "phone",
      "fromAddress",
      "toAddress",
      "deliveryDate",
    ];
    const missing = required.find((k) => !form[k]);
    if (missing) return message.warning("모든 정보를 입력해주세요.");

    const totalBags = bags.S + bags.M + bags.L;
    if (totalBags === 0)
      return message.warning("가방 개수를 1개 이상 입력해주세요.");

    const dto = {
      startAddr: form.fromAddress,
      endAddr: form.toAddress,
      deliveryDate: form.deliveryDate.format("YYYY-MM-DD"),
      timeSlot: form.timeSlot || null,
      totalPrice: estimatedFare,
      bags,
      memo: form.memo,
      phone: form.phone,
    };

    try {
      const res = await axios.post(`${API_SERVER_HOST}/api/delivery/rsv`, dto, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("============");
      console.log("drsvID: ", res.data.drsvId);
      dispatch(
        setReserveData({
          rsvType: "DLV",
          reserveId: res.data.data.drsvId,
          itemData: res.data.data,
          items: [
            {
              reserveId: res.data.data.drsvId,
              amount: estimatedFare,
            },
          ],
        })
      );

      message.success("짐배송 예약이 완료되었습니다!");
      navigate("/payment", {
        state: {
          rsvType: "DLV",
          items: [
            {
              reserveId: res.data.data.drsvId,
              amount: estimatedFare,
            },
          ],
          formData: form,
          totalPrice: estimatedFare,
        },
      });
    } catch (error) {
      console.error("❌ [DeliveryPage] 예약 요청 실패:", error);
      message.error("예약 중 오류가 발생했습니다.");
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 1200, margin: "48px auto", padding: "0 20px" }}>
        <Row gutter={[20, 20]} align="stretch">
          {/* ✅ 왼쪽 입력폼 */}
          <Col xs={24} md={12}>
            <Card
              style={{
                height: "100%",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                position: "relative",
              }}
              styles={{ body: { padding: "24px 28px" } }}
            >
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                style={{
                  position: "absolute",
                  top: 20,
                  left: 20,
                  color: "#1677ff",
                  fontWeight: "500",
                }}
                onClick={() => navigate(-1)}
              ></Button>
              <Title level={3} style={{ textAlign: "center", color: "#1677ff" }}>
                짐배송 예약
              </Title>

              <Input
                placeholder="이름"
                value={form.senderName}
                onChange={(e) => handleNameChange(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <Input
                placeholder="전화번호 (010-1234-5678)"
                value={form.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                style={{ marginBottom: 12 }}
                maxLength={13}
              />

              <Text strong>배송 방향</Text>
              <div style={{ display: "flex", gap: 8, margin: "8px 0 12px" }}>
                {[
                  { value: "AIRPORT_TO_HOTEL", label: "공항 → 숙소" },
                  { value: "HOTEL_TO_AIRPORT", label: "숙소 → 공항" },
                  { value: "HOTEL_TO_HOTEL", label: "숙소 ↔ 숙소" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type={
                      form.deliveryType === opt.value ? "primary" : "default"
                    }
                    onClick={() => handleDeliveryTypeChange(opt.value)}
                    style={{ flex: 1, height: 36, fontWeight: 500 }}
                    disabled={!isMapReady}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>

              <Text strong>출발지 주소</Text>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Input
                  placeholder="출발지 주소"
                  value={form.fromAddress}
                  onChange={(e) =>
                    handleChange("fromAddress", e.target.value)
                  }
                />
                <Button onClick={() => handleSearchAddress("fromAddress")}>
                  찾기
                </Button>
              </div>

              <Text strong>도착지 주소</Text>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <Input
                  placeholder="도착지 주소"
                  value={form.toAddress}
                  onChange={(e) => handleChange("toAddress", e.target.value)}
                />
                <Button onClick={() => handleSearchAddress("toAddress")}>
                  찾기
                </Button>
              </div>

              <Text strong>배송 날짜 / 시간대</Text>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <DatePicker
                  value={form.deliveryDate ? dayjs(form.deliveryDate) : null}
                  onChange={(date) => handleChange("deliveryDate", date)}
                  placeholder="날짜 선택"
                  style={{ flex: 1 }}
                  disabledDate={(current) => current && current < dayjs().endOf("day")}
                />
                <Radio.Group
                  value={form.timeSlot}
                  onChange={(e) => handleChange("timeSlot", e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="오전">오전</Radio.Button>
                  <Radio.Button value="오후">오후</Radio.Button>
                </Radio.Group>
              </div>

              {/* ✅ 가방 정보 (설명 추가됨) */}
              <Text strong>가방 정보</Text>
              <Row gutter={[8, 8]} style={{ margin: "8px 0 10px" }}>
                {["S", "M", "L"].map((size) => {
                  const sizeInfo = {
                    S: "기내 휴대용 (20인치 이하)",
                    M: "중형 수하물 (24인치)",
                    L: "대형 수하물 (28인치 이상)",
                  };

                  return (
                    <Col span={8} key={size} style={{ textAlign: "center" }}>
                      <Text strong>{size}</Text>
                      <div style={{ color: "#999", fontSize: 11, marginBottom: 2 }}>
                        {sizeInfo[size]}
                      </div>
                      <div style={{ color: "#666", fontSize: 12 }}>
                        {BAG_PRICE_TABLE[size].toLocaleString()}원
                      </div>
                      <Input
                        size="small"
                        type="number"
                        min="0"
                        value={bags[size]}
                        onChange={(e) => handleBagChange(size, e.target.value)}
                        style={{ width: 60, marginTop: 4 }}
                      />
                    </Col>
                  );
                })}
              </Row>

              <Text strong>요청사항(선택)</Text>
              <Input.TextArea
                rows={2}
                value={form.memo}
                onChange={(e) => handleChange("memo", e.target.value)}
                style={{ marginBottom: 10 }}
              />

              {estimatedFare > 0 && (
                <div
                  style={{
                    background: "#f0f5ff",
                    color: "#1677ff",
                    textAlign: "center",
                    padding: 6,
                    borderRadius: 6,
                    marginBottom: 10,
                    fontSize: 13,
                  }}
                >
                  <strong>예상 요금:</strong>{" "}
                  {estimatedFare.toLocaleString()}원
                </div>
              )}

              <Button
                type="primary"
                block
                size="middle"
                style={{ fontWeight: 600, borderRadius: 6, height: 38 }}
                onClick={showConfirmModal}
              >
                예약하기
              </Button>
            </Card>
          </Col>

          {/* ✅ 지도 */}
          <Col xs={24} md={12}>
            <Card
              style={{
                height: "100%",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              styles={{ body: { padding: 0 } }}
            >
              <div
                id={MAP_CONTAINER_ID}
                style={{
                  width: "100%",
                  height: "calc(100vh - 200px)",
                  minHeight: 500,
                }}
              ></div>
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default DeliveryPage;
