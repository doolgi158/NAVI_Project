import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { setReserveData } from "../../../common/slice/paymentSlice";
import { useDispatch } from "react-redux";
import {
  Card,
  Input,
  DatePicker,
  Radio,
  Button,
  Typography,
  Divider,
  message,
  Row,
  Col,
} from "antd";
import {
  LeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import MainLayout from "../../layout/MainLayout";
import dayjs from "dayjs";
import axios from "axios";


const API_SERVER_HOST = "http://localhost:8080";
const { Title, Text } = Typography;

const FlightRsvInputPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedOutbound = state?.selectedOutbound;
  const selectedInbound = state?.selectedInbound;
  const passengerCount = state?.passengerCount || 1;

  const [passengers, setPassengers] = useState([]);
  const phoneRefs = useRef([]);

  const formatDateTime = (str) => {
    if (!str) return "";
    const d = new Date(str);
    const day = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(d.getDate()).padStart(2, "0")} (${day}) ${String(
      d.getHours()
    ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  useEffect(() => {
    setPassengers(
      Array.from({ length: passengerCount }, () => ({
        name: "",
        birth: null,
        gender: "M",
        phone: "010-",
        email: "",
      }))
    );
  }, [passengerCount]);

  /** ✅ 전화번호 입력 핸들러 */
  const handlePhoneChange = (i, value) => {
    let raw = value.replace(/[^0-9]/g, "");
    if (!raw.startsWith("010")) raw = "010" + raw.replace(/^010/, "");
    const digits = raw.slice(3);
    let formatted = "010-";
    if (digits.length <= 4) formatted += digits;
    else formatted += `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
    const updated = [...passengers];
    updated[i].phone = formatted;
    setPassengers(updated);
  };

  /** ✅ 커서 항상 뒤로 */
  const handlePhoneFocus = (i) => {
    const input = phoneRefs.current[i]?.input;
    if (input) {
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  };

  /** ✅ 공통 입력 핸들러 */
  const handleChange = (i, field, value) => {
    const updated = [...passengers];

    if (field === "name") {
      // ✅ 한글 + 영어만 허용 (숫자·특수문자 제거)
      updated[i][field] = value.replace(/[^a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ\s]/g, "");
    } else if (field === "phone") {
      handlePhoneChange(i, value);
      return;
    } else if (field === "email") {
      updated[i][field] = value.replace(/[^a-zA-Z0-9@._-]/g, "").trim();
    } else {
      updated[i][field] = value;
    }

    setPassengers(updated);
  };

  const isValidEmail = (email) => {
    const atCount = (email.match(/@/g) || []).length;
    const dotCount = (email.match(/\./g) || []).length;
    return (
      atCount === 1 &&
      dotCount >= 1 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
  };

  const isIncomplete = passengers.some(
    (p) =>
      !p.name ||
      !p.birth ||
      !p.gender ||
      !/^010-\d{3,4}-\d{4}$/.test(p.phone) ||
      !isValidEmail(p.email)
  );

  /** ✅ 좌석 선택 페이지 이동 */
  const handleSeatSelection = () => {
    if (isIncomplete) {
      message.warning("모든 탑승객 정보를 입력해주세요.");
      return;
    }
    navigate(`/flight/seat`, {
      state: {
        isRoundTrip: !!selectedInbound,
        step: "outbound",
        selectedOutbound,
        selectedInbound,
        passengerCount,
        passengers,
      },
    });
  };

  /** ✅ 좌석 자동배정 */
  const handleAutoAssign = async () => {
    if (isIncomplete) {
      message.warning("모든 탑승객 정보를 입력해주세요.");
      return;
    }

    try {
      message.info("좌석을 선택하지 않은 경우 자동 배정됩니다.");

      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.warning("로그인이 필요합니다.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const outboundDto = {
        flightId:
          selectedOutbound.flightId?.flightId || selectedOutbound.flightNo,
        depTime: selectedOutbound.depTime?.split("T")[0],
        seatId: null,
        passengersJson: JSON.stringify(passengers),
        totalPrice: selectedOutbound.price * passengerCount,
        status: "PENDING",
      };

      const resOut = await axios.post(
        `${API_SERVER_HOST}/api/flight/reservation`,
        outboundDto,
        { headers }
      );

      let resIn = null;
      if (selectedInbound) {
        const inboundDto = {
          flightId:
            selectedInbound.flightId?.flightId || selectedInbound.flightNo,
          depTime: selectedInbound.depTime?.split("T")[0],
          seatId: null,
          passengersJson: JSON.stringify(passengers),
          totalPrice: selectedInbound.price * passengerCount,
          status: "PENDING",
        };

        resIn = await axios.post(
          `${API_SERVER_HOST}/api/flight/reservation`,
          inboundDto,
          { headers }
        );
      }

      message.success("항공편 예약이 완료되었습니다!");

      // 결제용 items 배열 구성
      const totalPrice = (selectedOutbound.price + (selectedInbound?.price || 0)) * passengerCount;

      const items = [];
      if (resOut?.data?.data?.frsvId) {
        items.push({
          reserveId: resOut.data.data.frsvId,
          amount: selectedOutbound.price || 0,
        });
      }
      if (resIn?.data?.data?.frsvId) {
        items.push({
          reserveId: resIn.data.data.frsvId,
          amount: selectedInbound?.price || 0,
        });
      }

      dispatch(setReserveData({
        rsvType: "FLY",
        items,
        itemData: {
          selectedOutbound,
          selectedInbound,
        },
        formData: {
          passengers,
          passengerCount,
          totalPrice,
        },
      }));

      navigate(`/payment`, {
        state: {
          reservation: [resOut.data.data, resIn?.data?.data].filter(Boolean),
          rsvType: "FLY",
          items,
          itemData: {
            selectedOutbound,
            selectedInbound,
          },
          formData: {
            passengers,
            passengerCount,
            totalPrice,
            autoAssign: true,
          },
        },
      });
    } catch (error) {
      console.error("❌ 자동배정 예약 실패:", error);
      const msg =
        error.response?.data?.message ||
        "예약 중 오류가 발생했습니다. 다시 시도해주세요.";
      message.error(msg);
    }
  };

  const handleBack = () => navigate(-1);

  return (
    <MainLayout>
      <div
        style={{
          background:
            "linear-gradient(160deg, #eaf1fb 0%, #fdfdff 35%, #edf4fe 100%)",
          minHeight: "100vh",
          padding: "70px 0",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Card
          variant="borderless"
          style={{
            width: "92%",
            maxWidth: 960,
            borderRadius: 24,
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            padding: "40px 50px",
          }}
        >
          {/* 헤더 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 35,
              gap: 12,
            }}
          >
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={handleBack}
              style={{ color: "#2563eb", fontSize: 18 }}
            />
            <Title level={3} style={{ margin: 0, color: "#1e3a8a" }}>
              탑승객 정보 입력
            </Title>
          </div>

          {/* 출발편 카드 */}
          {selectedOutbound && (
            <Card
              size="small"
              variant="borderless"
              style={{
                background: "linear-gradient(120deg, #eef6ff 0%, #e0f0ff 100%)",
                border: "1px solid #c5dcff",
                borderRadius: 16,
                marginBottom: 18,
              }}
            >
              <Text strong style={{ color: "#2563eb" }}>
                ✈️ 출발편
              </Text>
              <div style={{ marginTop: 4 }}>
                <Text strong style={{ fontSize: 15 }}>
                  {selectedOutbound.airlineNm} {selectedOutbound.flightNo}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {selectedOutbound.depAirportName} →{" "}
                  {selectedOutbound.arrAirportName}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {formatDateTime(selectedOutbound.depTime)} 출발 ·{" "}
                  {formatDateTime(selectedOutbound.arrTime)} 도착
                </Text>
                <br />
                <Text strong style={{ color: "#2563eb", fontSize: 15 }}>
                  ₩{selectedOutbound.price.toLocaleString()}
                </Text>
              </div>
            </Card>
          )}

          {/* 귀국편 카드 */}
          {selectedInbound && (
            <Card
              size="small"
              variant="borderless"
              style={{
                background: "linear-gradient(120deg, #f1fff5 0%, #e0ffe7 100%)",
                border: "1px solid #bdecc3",
                borderRadius: 16,
                marginBottom: 20,
              }}
            >
              <Text strong style={{ color: "#16a34a" }}>
                🛬 귀국편
              </Text>
              <div style={{ marginTop: 4 }}>
                <Text strong style={{ fontSize: 15 }}>
                  {selectedInbound.airlineNm} {selectedInbound.flightNo}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {selectedInbound.depAirportName} →{" "}
                  {selectedInbound.arrAirportName}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {formatDateTime(selectedInbound.depTime)} 출발 ·{" "}
                  {formatDateTime(selectedInbound.arrTime)} 도착
                </Text>
                <br />
                <Text strong style={{ color: "#16a34a", fontSize: 15 }}>
                  ₩{selectedInbound.price.toLocaleString()}
                </Text>
              </div>
            </Card>
          )}

          <Divider />

          {/* 탑승객 입력 */}
          <Title
            level={4}
            style={{
              color: "#1e3a8a",
              marginBottom: 16,
              letterSpacing: "0.5px",
            }}
          >
            탑승객 정보
          </Title>

          {passengers.map((p, i) => (
            <Card
              key={i}
              size="small"
              variant="borderless"
              title={
                <Text strong style={{ color: "#334155" }}>
                  👤 탑승객 {i + 1}
                </Text>
              }
              style={{
                background: "linear-gradient(135deg, #fafcff 0%, #f5f9ff 100%)",
                border: "1px solid #dce6fa",
                borderRadius: 16,
                marginBottom: 24,
                boxShadow: "0 3px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <label className="text-gray-600 text-sm">이름</label>
                  <Input
                    size="large"
                    prefix={<UserOutlined />}
                    placeholder="예: 홍길동 / John Doe"
                    value={p.name}
                    onChange={(e) => handleChange(i, "name", e.target.value)}
                    style={{
                      borderRadius: 10,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  />
                </Col>

                <Col xs={24} md={8}>
                  <label className="text-gray-600 text-sm">생년월일</label>
                  <DatePicker
                    size="large"
                    value={p.birth ? dayjs(p.birth) : null}
                    onChange={(d, ds) => handleChange(i, "birth", ds)}
                    disabledDate={(current) =>
                      current && current > dayjs().endOf("day")
                    } // ✅ 내일부터 선택 불가
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                    placeholder="YYYY-MM-DD"
                    suffixIcon={<CalendarOutlined />}
                  />
                </Col>

                <Col xs={24} md={8}>
                  <label className="text-gray-600 text-sm">성별</label>
                  <Radio.Group
                    value={p.gender}
                    onChange={(e) => handleChange(i, "gender", e.target.value)}
                    buttonStyle="solid"
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-evenly",
                      paddingTop: 4,
                    }}
                  >
                    <Radio.Button value="M" style={{ flex: 1 }}>
                      남성
                    </Radio.Button>
                    <Radio.Button value="F" style={{ flex: 1 }}>
                      여성
                    </Radio.Button>
                  </Radio.Group>
                </Col>

                <Col xs={24} md={12}>
                  <label className="text-gray-600 text-sm">전화번호</label>
                  <Input
                    ref={(el) => (phoneRefs.current[i] = el)}
                    size="large"
                    prefix={<PhoneOutlined />}
                    placeholder="010-1234-5678"
                    value={p.phone}
                    onFocus={() => handlePhoneFocus(i)}
                    onChange={(e) => handleChange(i, "phone", e.target.value)}
                    maxLength={13}
                    style={{
                      borderRadius: 10,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  />
                </Col>

                <Col xs={24} md={12}>
                  <label className="text-gray-600 text-sm">이메일</label>
                  <Input
                    size="large"
                    prefix={<MailOutlined />}
                    placeholder="example@email.com"
                    value={p.email}
                    onChange={(e) => handleChange(i, "email", e.target.value)}
                    style={{
                      borderRadius: 10,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  />
                </Col>
              </Row>
            </Card>
          ))}

          {/* 버튼 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 30,
            }}
          >
            <Button
              size="large"
              onClick={handleAutoAssign}
              style={{
                background: "#f3f4f6",
                color: "#334155",
                borderRadius: 10,
                fontWeight: 500,
                width: 180,
                height: 45,
              }}
            >
              좌석 자동배정
            </Button>

            <Button
              type="primary"
              size="large"
              onClick={handleSeatSelection}
              style={{
                borderRadius: 10,
                fontWeight: 600,
                width: 200,
                height: 45,
                background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
                boxShadow: "0 4px 10px rgba(37,99,235,0.3)",
              }}
            >
              좌석 선택하기 →
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default FlightRsvInputPage;