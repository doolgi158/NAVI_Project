import React from "react";
import { Typography, Divider } from "antd";
const { Text } = Typography;

const DlvRsvInfo = ({ data, formData }) => {
  console.log("📦 [DlvRsvInfo] props 확인:", { data, formData });

  if (!formData) return null;
  const { fromAddress, toAddress, deliveryDate, bagSize, bagCount, memo, totalPrice, deliveryType } =
    formData;

  const typeLabel =
    deliveryType === "AIRPORT_TO_HOTEL"
      ? "공항 → 숙소"
      : deliveryType === "HOTEL_TO_AIRPORT"
      ? "숙소 → 공항"
      : "숙소 ↔ 숙소";

  return (
    <div>
      <Divider orientation="left">짐배송 정보</Divider>
      <Text strong>배송 방향:</Text> <Text>{typeLabel}</Text><br />
      <Text strong>출발지:</Text> <Text>{fromAddress}</Text><br />
      <Text strong>도착지:</Text> <Text>{toAddress}</Text><br />
      <Text strong>배송일자:</Text> <Text>{deliveryDate}</Text><br />
      <Text strong>가방 정보:</Text> <Text>{bagSize} ({bagCount}개)</Text><br />
      <Text strong>요청사항:</Text> <Text>{memo || "없음"}</Text><br />
      <Divider />
      <Text strong>총 금액:</Text> <Text type="danger" strong>{totalPrice?.toLocaleString()}원</Text>
    </div>
  );
};
export default DlvRsvInfo;
