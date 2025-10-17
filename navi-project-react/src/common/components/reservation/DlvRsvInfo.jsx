import React from "react";
import { Typography, Divider } from "antd";
const { Text } = Typography;

const DlvRsvInfo = ({ data, formData }) => {
  console.log("📦 [DlvRsvInfo] props 확인:", { data, formData });

  if (!formData) return null;

  const fromAddress = formData.fromAddress || formData.startAddr || "출발지 미지정";
  const toAddress = formData.toAddress || formData.endAddr || "도착지 미지정";
  const { deliveryDate, bagSize, bagCount, memo, totalPrice, totalAmount, deliveryType } =
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
      <Text strong>배송 방향:</Text> <Text>{typeLabel}</Text>
      <br />
      <Text strong>출발지:</Text> <Text>{fromAddress}</Text>
      <br />
      <Text strong>도착지:</Text> <Text>{toAddress}</Text>
      <br />
      <Text strong>배송일자:</Text> <Text>{deliveryDate}</Text>
      <br />
      <Text strong>가방 정보:</Text>{" "}
      <Text>
        {bagSize || "사이즈 미지정"} ({bagCount || 0}개)
      </Text>
      <br />
      <Text strong>요청사항:</Text> <Text>{memo || "없음"}</Text>
      <br />
      <Divider />
      <Text strong>총 금액:</Text>{" "}
      <Text type="danger" strong>
        {(totalPrice ?? totalAmount ?? 0).toLocaleString()}원
      </Text>
    </div>
  );
};

export default DlvRsvInfo;
