import React from "react";
import { Card, Typography, Divider, Space } from "antd";
import dayjs from "dayjs";

const { Title, Text } = Typography;

/**
 * 📦 짐배송 요약 카드 (우측 결제 요약)
 * - 출발지, 도착지, 배송일, 가방 크기·개수, 예상 요금 표시
 */
const DlvRsvSumCard = ({ formData, bags, totalAmount }) => {
  if (!formData) {
    return (
      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          background: "#fff",
          border: "1px solid #f0f0f0",
        }}
        bodyStyle={{ padding: "22px" }}
      >
        <Text type="secondary">짐배송 예약 정보가 없습니다.</Text>
      </Card>
    );
  }

  const fromAddress = formData.fromAddress || "출발지 미지정";
  const toAddress = formData.toAddress || "도착지 미지정";

  // ✅ 날짜 안전 포맷 처리
  const deliveryDate = formData.deliveryDate
    ? dayjs(formData.deliveryDate).isValid()
      ? dayjs(formData.deliveryDate).format("YYYY-MM-DD")
      : formData.deliveryDate.toString()
    : "날짜 미지정";

  // ✅ 가방 요약 표시
  const bagSummary =
    bags && Object.values(bags).some((v) => v > 0)
      ? Object.entries(bags)
          .filter(([_, count]) => count > 0)
          .map(([size, count]) => `${size}(${count}개)`)
          .join(", ")
      : "없음";

  return (
    <Card
      style={{
        borderRadius: 16,
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        background: "#fff",
        border: "1px solid #f0f0f0",
      }}
      bodyStyle={{ padding: "22px" }}
    >
      <Title level={5} style={{ color: "#003366", marginBottom: 12 }}>
        🧾 짐배송 예약 요약
      </Title>

      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <div>
          <Text strong>출발지</Text>
          <br />
          <Text type="secondary">{fromAddress}</Text>
        </div>

        <div>
          <Text strong>도착지</Text>
          <br />
          <Text type="secondary">{toAddress}</Text>
        </div>

        <div>
          <Text strong>배송일자</Text>
          <br />
          <Text type="secondary">{deliveryDate}</Text>
        </div>

        <div>
          <Text strong>가방 정보</Text>
          <br />
          <Text type="secondary">{bagSummary}</Text>
        </div>

        <Divider style={{ margin: "10px 0" }} />

        <Text strong>총금액</Text>
        <Title
          level={4}
          style={{
            margin: 0,
            color: "#1677ff",
            fontWeight: 700,
          }}
        >
          ₩{(totalAmount || 0).toLocaleString()}
        </Title>
      </Space>
    </Card>
  );
};

export default DlvRsvSumCard;
