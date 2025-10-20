import React from "react";
import { Typography, Divider, Card, Space } from "antd";

const { Title, Text } = Typography;

/**
 * ✈️ 항공 예약 정보 컴포넌트 (탑승객 + 좌석 자동 배정 안내만 표시)
 * - 항공 일정(출발/귀국)은 제거됨 → FlySummaryCard에서 처리
 */
const FlyRsvInfo = ({ data, formData }) => {
  if (!data || !formData) return null;

  const { passengers, passengerCount, autoAssign } = formData;

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

      {/* ✅ 좌석 자동 배정 안내 */}
      {autoAssign && (
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
      )}
    </div>
  );
};

export default FlyRsvInfo;
