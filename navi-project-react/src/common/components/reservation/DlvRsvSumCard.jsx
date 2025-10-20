import React from "react";
import { Card, Typography, Divider } from "antd";

const { Title, Text } = Typography;

/**
 * 📦 짐배송 결제/요약 전용 카드
 * - 출발지, 도착지, 배송일, 가방 크기·개수, 예상 요금
 */
const DlvRsvSumCard = ({ items, formData }) => {
  if (!items || !formData) {
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
        짐배송 예약 요약
      </Title>

      {/* 배송 정보 */}
      <div style={{ marginBottom: 10 }}>
        <Text strong>출발지</Text>
        <br />
        <Text type="secondary">{formData.startAddr}</Text>
        <Divider style={{ margin: "10px 0" }} />
        <Text strong>도착지</Text>
        <br />
        <Text type="secondary">{formData.endAddr}</Text>
      </div>

      <Text type="secondary" style={{ fontSize: 13 }}>
        배송일자 : {formData.deliveryDate}
      </Text>
      <br />
      <Text type="secondary" style={{ fontSize: 13 }}>
        가방 {formData.bagCount}개 ({formData.bagSize}사이즈)
      </Text>

      <Divider />

      {/* 요금 */}
      <Text strong>예상 요금</Text>
      <Title
        level={4}
        style={{ margin: 0, color: "#1677ff", fontWeight: 700 }}
      >
        ₩{formData.totalPrice?.toLocaleString()}
      </Title>
    </Card>
  );
};

export default DlvRsvSumCard;
