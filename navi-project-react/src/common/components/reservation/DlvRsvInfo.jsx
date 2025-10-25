import React from "react";
import { Typography, Divider, Space } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

/**
 * 📋 짐배송 결제 정보 상세 (좌측 영역)
 * - 사용자가 입력한 정보(formData)를 기반으로 표시
 */
const DlvRsvInfo = ({ formData, bags }) => {
  if (!formData) return null;

  const fromAddress = formData.fromAddress || "출발지 미지정";
  const toAddress = formData.toAddress || "도착지 미지정";
  const memo = formData.memo || "없음";

  // ✅ 날짜 변환 (Date | dayjs | string 모두 대응)
  const deliveryDate = formData.deliveryDate
    ? dayjs(formData.deliveryDate).isValid()
      ? dayjs(formData.deliveryDate).format("YYYY-MM-DD")
      : formData.deliveryDate.toString()
    : "날짜 미지정";

  // ✅ 배송 방향 라벨
  const typeLabel =
    formData.deliveryType === "AIRPORT_TO_HOTEL"
      ? "공항 → 숙소"
      : formData.deliveryType === "HOTEL_TO_AIRPORT"
      ? "숙소 → 공항"
      : "숙소 ↔ 숙소";

  // ✅ 가방 정보 요약
  const bagSummary =
    bags && Object.values(bags).some((v) => v > 0)
      ? Object.entries(bags)
          .filter(([_, count]) => count > 0)
          .map(([size, count]) => `${size}(${count}개)`)
          .join(", ")
      : "없음";

  return (
    <div>
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <Text strong>배송 방향:</Text>
        <Text type="secondary">{typeLabel}</Text>

        <Text strong>출발지:</Text>
        <Text type="secondary">{fromAddress}</Text>

        <Text strong>도착지:</Text>
        <Text type="secondary">{toAddress}</Text>

        <Text strong>배송일자:</Text>
        <Text type="secondary">{deliveryDate}</Text>

        <Divider style={{ margin: "8px 0" }} />

        <Text strong>보내는 분 이름:</Text>
        <Text type="secondary">{formData.senderName || "미입력"}</Text>

        <Text strong>연락처:</Text>
        <Text type="secondary">{formData.phone || "미입력"}</Text>

        <Text strong>가방 정보:</Text>
        <Text type="secondary">{bagSummary}</Text>

        <Text strong>요청사항:</Text>
        <Text type="secondary">{memo}</Text>
      </Space>
    </div>
  );
};

export default DlvRsvInfo;
