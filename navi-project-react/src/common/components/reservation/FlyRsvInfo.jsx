import React from "react";
import { Typography, Divider, Card, Space, Tag, Row, Col } from "antd";

const { Title, Text } = Typography;

/**
 * ✈️ 항공 예약 정보 컴포넌트 (탑승객 + 좌석 정보 표시)
 * - 선택 좌석이 있을 경우: 좌석 정보 표시
 * - autoAssign=true인 경우: 자동 배정 안내
 */
const FlyRsvInfo = ({ formData }) => {
  if (!formData) return null;

  const { passengers, passengerCount, autoAssign, selectedSeats = [] } = formData;

  // ✅ 좌석 정보가 있는지 판별
  const hasSeatInfo = Array.isArray(selectedSeats) && selectedSeats.length > 0;

  return (
    <div className="space-y-6 mt-4">
      {/* ✅ 탑승객 정보 */}
      <Divider
        orientation="left"
        style={{
          fontWeight: 600,
          borderColor: "#e5e7eb",
          marginBottom: 10,
        }}
      >
        탑승객 정보 ({passengerCount}명)
      </Divider>

      {Array.isArray(passengers) && passengers.length > 0 ? (
        <div className="space-y-4">
          {passengers.map((p, idx) => (
            <Card
              key={idx}
              size="small"
              style={{
                borderRadius: 10,
                border: "1px solid #dbeafe",
                backgroundColor: "#f8fbff",
              }}
            >
              <Space direction="vertical" size={2}>
                <Text strong className="text-gray-800">
                  👤 탑승객 {idx + 1}: {p.name}
                </Text>
                <Text type="secondary">생년월일: {p.birth}</Text>
                <Text type="secondary">
                  성별: {p.gender === "M" ? "남성" : "여성"}
                </Text>
                <Text type="secondary">전화: {p.phone}</Text>
                <Text type="secondary">이메일: {p.email}</Text>
              </Space>
            </Card>
          ))}
        </div>
      ) : (
        <Text type="secondary">탑승객 정보 없음</Text>
      )}

      {/* ✅ 좌석 정보 */}
      <Divider
        orientation="left"
        style={{
          fontWeight: 600,
          borderColor: "#e5e7eb",
          margin: "24px 0 10px",
        }}
      >
        좌석 정보
      </Divider>

      {hasSeatInfo ? (
        <div className="space-y-2">
          {selectedSeats.map((s, idx) => (
            <Card
              key={s.seatNo || idx}
              size="small"
              style={{
                borderRadius: 10,
                border: "1px solid #dcfce7",
                backgroundColor: "#f0fdf4",
              }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Tag color={s.seatClass === "PRESTIGE" ? "blue" : "green"}>
                    {s.seatNo}
                  </Tag>
                  <Text strong className="ml-2">
                    {s.seatClass === "PRESTIGE" ? "비즈니스석" : "일반석"}
                  </Text>
                </Col>
                <Col>
                  <Text strong style={{ color: "#2563eb" }}>
                    ₩{(s.totalPrice || 0).toLocaleString()}
                  </Text>
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      ) : autoAssign ? (
        <div
          style={{
            backgroundColor: "#fff7e6",
            border: "1px solid #ffe58f",
            borderRadius: 10,
            padding: "10px 14px",
            marginTop: 16,
          }}
        >
          <Text strong type="warning">
            ⚙️ 좌석 자동 배정 예정
          </Text>
        </div>
      ) : (
        <Text type="secondary">좌석 정보 없음</Text>
      )}
    </div>
  );
};

export default FlyRsvInfo;
