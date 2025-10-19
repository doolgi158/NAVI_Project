import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import MainLayout from "../../layout/MainLayout";
import {
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Tooltip,
  Tag,
  Divider,
  message,
  Affix,
  Skeleton,
} from "antd";
import { LeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const API_SERVER_HOST = "http://localhost:8080";

const SeatSelectPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    isRoundTrip = false,
    step = "outbound",
    selectedOutbound,
    selectedInbound,
    passengerCount = 1,
    passengers = [],
    outboundSeats: prevOutboundSeats = [],
  } = state || {};

  const flight = step === "outbound" ? selectedOutbound : selectedInbound;

  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const flightIdValue =
    flight?.flightId?.flightId || flight?.flightNo || flight?.flightId;
  const depTimeValue = flight?.flightId?.depTime || flight?.depTime;

  const formatDateTimeKOR = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(date.getDate()).padStart(2, "0")} (${days[date.getDay()]}) ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const sessionKey = useMemo(() => {
    if (!flightIdValue || !depTimeValue) return null;
    const dt = depTimeValue.includes("T")
      ? depTimeValue
      : depTimeValue.replace(" ", "T");
    return `pseudoReserved_${flightIdValue}_${dt}`;
  }, [flightIdValue, depTimeValue]);

  useEffect(() => {
    let mounted = true;
    const fetchSeats = async () => {
      if (!flightIdValue || !depTimeValue) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const formattedDepTime = depTimeValue.includes("T")
          ? depTimeValue
          : depTimeValue.replace(" ", "T");

        const res = await axios.get(
          `${API_SERVER_HOST}/api/seats/${encodeURIComponent(flightIdValue)}`,
          { params: { depTime: formattedDepTime } }
        );

        let seatData = Array.isArray(res.data) ? res.data : [];

        seatData = seatData.map((s) => ({
          ...s,
          seatClass: s.seatClass || s.seat_class || "ECONOMY",
          totalPrice: s.totalPrice ?? s.price ?? 0,
          isReserved: !!s.isReserved,
          seatNo: s.seatNo || s.seat_no,
        }));

        // ✅ 랜덤 예약 좌석 유지
        if (seatData.length > 0 && sessionKey) {
          let reservedIndexes = [];
          const stored = sessionStorage.getItem(sessionKey);
          if (stored) reservedIndexes = JSON.parse(stored);
          else {
            const total = seatData.length;
            const ratio = 0.2 + Math.random() * 0.1;
            const count = Math.max(1, Math.floor(total * ratio));
            const set = new Set();
            while (set.size < Math.min(count, total)) {
              set.add(Math.floor(Math.random() * total));
            }
            reservedIndexes = Array.from(set);
            sessionStorage.setItem(sessionKey, JSON.stringify(reservedIndexes));
          }
          seatData = seatData.map((s, i) =>
            reservedIndexes.includes(i) ? { ...s, isReserved: true } : s
          );
        }

        if (mounted) {
          setSeats(seatData);
          setSelectedSeats([]);
          setTotalPrice(0);
        }
      } catch {
        message.error("좌석 정보를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSeats();
    return () => {
      mounted = false;
    };
  }, [step, flightIdValue, depTimeValue, sessionKey]);

  const groupByRow = (arr) => {
    const rows = {};
    arr.forEach((s) => {
      const rowNum = (s.seatNo || "").replace(/[^0-9]/g, "");
      if (!rows[rowNum]) rows[rowNum] = [];
      rows[rowNum].push(s);
    });
    Object.keys(rows).forEach((r) =>
      rows[r].sort((a, b) => a.seatNo.localeCompare(b.seatNo))
    );
    return rows;
  };

  const prestigeRows = useMemo(
    () => groupByRow(seats.filter((s) => s.seatClass === "PRESTIGE")),
    [seats]
  );

  const economyRows = useMemo(
    () => groupByRow(seats.filter((s) => s.seatClass === "ECONOMY")),
    [seats]
  );

  const handleSeatClick = (seat) => {
    if (seat.isReserved) return;
    const exists = selectedSeats.find((s) => s.seatNo === seat.seatNo);
    let updated;
    if (exists) updated = selectedSeats.filter((s) => s.seatNo !== seat.seatNo);
    else {
      if (selectedSeats.length >= passengerCount)
        return message.warning(`탑승객 수(${passengerCount}) 이상 선택 불가`);
      updated = [...selectedSeats, seat];
    }
    setSelectedSeats(updated);
    setTotalPrice(updated.reduce((sum, s) => sum + (s.totalPrice || 0), 0));
  };

  const handleNext = () => {
    if (selectedSeats.length !== passengerCount)
      return message.warning(`탑승객 수(${passengerCount})에 맞게 좌석을 선택하세요.`);
    if (isRoundTrip && step === "outbound")
      navigate("/flight/seat", {
        state: {
          isRoundTrip: true,
          step: "inbound",
          selectedOutbound,
          selectedInbound,
          passengerCount,
          passengers,
          outboundSeats: selectedSeats,
        },
      });
    else
      navigate("/flight/payment", {
        state: {
          selectedOutbound,
          selectedInbound,
          outboundSeats: step === "outbound" ? selectedSeats : prevOutboundSeats,
          inboundSeats: step === "inbound" ? selectedSeats : [],
          passengerCount,
          passengers,
          totalPrice:
            step === "outbound"
              ? selectedSeats.reduce((s, x) => s + (x.totalPrice || 0), 0)
              : (prevOutboundSeats || []).reduce(
                  (s, x) => s + (x.totalPrice || 0),
                  0
                ) +
                selectedSeats.reduce((s, x) => s + (x.totalPrice || 0), 0),
        },
      });
  };

  const handleBack = () => navigate(-1);

  const SeatButton = ({ seat }) => {
    const selected = selectedSeats.some((s) => s.seatNo === seat.seatNo);
    const isPrestige = seat.seatClass === "PRESTIGE";

    const bg = seat.isReserved
      ? "#e5e7eb"
      : selected
      ? "#fff4cc"
      : isPrestige
      ? "#dce8ff"
      : "#d4f2e8";

    const border = seat.isReserved
      ? "1px solid #d1d5db"
      : selected
      ? "1px solid #fbbf24"
      : "1px solid #e5e7eb";

    return (
      <Tooltip title={`${seat.seatNo} (${isPrestige ? "비즈니스석" : "일반석"})`}>
        <Button
          onClick={() => handleSeatClick(seat)}
          disabled={seat.isReserved}
          style={{
            width: 38,
            height: 38,
            padding: 0,
            borderRadius: 10,
            border,
            background: bg,
            color: seat.isReserved ? "#9ca3af" : "#1f2937",
            boxShadow: selected
              ? "0 0 0 2px rgba(251,191,36,0.3)"
              : "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <Text strong style={{ fontSize: 12 }}>
            {seat.seatNo.replace(/[0-9]/g, "")}
          </Text>
        </Button>
      </Tooltip>
    );
  };

  return (
    <MainLayout>
      <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "50px 0" }}>
        <Row justify="center" gutter={[24, 24]}>
          {/* 🎫 메인 카드 */}
          <Col xs={23} lg={16} xl={14}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                background: "#ffffff",
                padding: "28px 36px",
              }}
            >
              <Space align="center" size={10} style={{ marginBottom: 12 }}>
                <Button type="text" icon={<LeftOutlined />} onClick={handleBack} />
                <Title level={4} style={{ margin: 0 }}>
                  {step === "outbound" ? "출발편 좌석 선택" : "귀국편 좌석 선택"}
                </Title>
              </Space>

              <Text type="secondary">
                {flight?.depAirportName} ✈️ {flight?.arrAirportName}
              </Text>
              <div style={{ marginTop: 4, marginBottom: 20 }}>
                <Text type="secondary">
                  {formatDateTimeKOR(flight?.depTime)} 출발 ·{" "}
                  {formatDateTimeKOR(flight?.arrTime)} 도착
                </Text>
              </div>

              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <Space direction="vertical" size={30} style={{ width: "100%" }}>
                  {/* ✅ 비즈니스석 */}
                  {Object.keys(prestigeRows).length > 0 && (
                    <div
                      style={{
                        background: "rgba(220,232,255,0.25)",
                        borderRadius: 16,
                        padding: 18,
                        boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Text strong style={{ color: "#1e3a8a" }}>
                        비즈니스석 (Prestige)
                      </Text>
                      <Divider style={{ margin: "8px 0 12px" }} />

                      {/* 열 헤더 */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 6,
                        }}
                      >
                        <div style={{ width: 40 }} />
                        {["A", "B", "C", "D"].map((col) => (
                          <Text
                            key={col}
                            style={{
                              width: 42,
                              textAlign: "center",
                              color: "#94a3b8",
                              fontWeight: 500,
                            }}
                          >
                            {col}
                          </Text>
                        ))}
                      </div>

                      {/* 좌석 */}
                      {Object.keys(prestigeRows)
                        .sort((a, b) => a - b)
                        .map((row) => (
                          <div
                            key={row}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 10,
                            }}
                          >
                            <Text
                              style={{
                                width: 40,
                                textAlign: "right",
                                color: "#64748b",
                                fontWeight: 500,
                              }}
                            >
                              {row}
                            </Text>
                            <div style={{ display: "flex", gap: 10 }}>
                              {prestigeRows[row].map((s) => (
                                <SeatButton seat={s} key={s.seatNo} />
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                {/* ✅ 일반석 (시각적 통로 여백 버전) */}
{Object.keys(economyRows).length > 0 && (
  <div
    style={{
      background: "rgba(212,242,232,0.25)",
      borderRadius: 16,
      padding: 18,
      marginTop: 30,
    }}
  >
    <Text strong style={{ color: "#166534" }}>
      일반석 (Economy)
    </Text>
    <Divider style={{ margin: "8px 0 12px" }} />

    {/* 열 헤더 */}
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        marginBottom: 6,
      }}
    >
      <div style={{ width: 40 }} />
      {["A", "B", "C", "D", "E", "F"].map((col, idx) => (
        <div
          key={col}
          style={{
            width: 42,
            textAlign: "center",
            color: "#94a3b8",
            fontWeight: 500,
            marginRight: idx === 2 ? 36 : 0, // ✅ C-D 사이 간격 넓게
          }}
        >
          {col}
        </div>
      ))}
    </div>

    {/* 좌석 */}
    {Object.keys(economyRows)
      .sort((a, b) => a - b)
      .map((row) => (
        <div
          key={row}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              width: 40,
              textAlign: "right",
              color: "#64748b",
              fontWeight: 500,
            }}
          >
            {row}
          </Text>

          <div style={{ display: "flex", gap: 12 }}>
            {economyRows[row].map((s, idx) => (
              <div
                key={s.seatNo}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: idx === 2 ? 36 : 0, // ✅ 통로 간격 확보
                }}
              >
                <SeatButton seat={s} />
              </div>
            ))}
          </div>
        </div>
      ))}
  </div>
)}
                </Space>
              )}
            </Card>
          </Col>

          {/* 🎯 사이드 패널 */}
          <Col xs={23} lg={8} xl={6}>
            <Affix offsetTop={24}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 16,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                }}
              >
                <Text strong>선택 정보</Text>
                <Divider style={{ margin: "8px 0 12px" }} />

                {selectedSeats.length === 0 ? (
                  <Text type="secondary">좌석을 선택하세요.</Text>
                ) : (
                  selectedSeats.map((s) => (
                    <Row key={s.seatNo} justify="space-between">
                      <Col>
                        <Tag color={s.seatClass === "PRESTIGE" ? "blue" : "green"}>
                          {s.seatNo}
                        </Tag>
                      </Col>
                      <Col>
                        <Text>₩{(s.totalPrice || 0).toLocaleString()}</Text>
                      </Col>
                    </Row>
                  ))
                )}

                <Divider style={{ margin: "12px 0" }} />
                <Row justify="space-between">
                  <Text type="secondary">선택 인원</Text>
                  <Text>
                    {selectedSeats.length}/{passengerCount}
                  </Text>
                </Row>
                <Row justify="space-between" style={{ marginTop: 6 }}>
                  <Text strong>총 금액</Text>
                  <Text strong style={{ fontSize: 18, color: "#2563eb" }}>
                    ₩{totalPrice.toLocaleString()}
                  </Text>
                </Row>

                {/* ✅ 버튼 한 줄 정렬 */}
                <Space
                  direction="horizontal"
                  size="middle"
                  style={{
                    width: "100%",
                    marginTop: 18,
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    size="large"
                    onClick={handleBack}
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      height: 46,
                    }}
                  >
                    뒤로가기
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleNext}
                    disabled={selectedSeats.length !== passengerCount}
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      height: 46,
                      background:
                        selectedSeats.length === passengerCount
                          ? "linear-gradient(90deg,#2563eb,#1d4ed8)"
                          : undefined,
                      boxShadow:
                        selectedSeats.length === passengerCount
                          ? "0 4px 10px rgba(37,99,235,0.3)"
                          : "none",
                    }}
                  >
                    {isRoundTrip && step === "outbound"
                      ? "귀국편 선택으로"
                      : "결제 진행하기"}
                  </Button>
                </Space>
              </Card>
            </Affix>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default SeatSelectPage;