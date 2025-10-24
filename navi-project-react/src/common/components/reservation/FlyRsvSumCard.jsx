// src/common/components/reservation/FlyRsvSumCard.jsx
import React from "react";
import { Card, Typography, Divider } from "antd";

const { Title, Text } = Typography;

/**
 * ✈️ 항공 결제/요약 전용 카드 컴포넌트
 * - 출발편 / 귀국편 / 총금액 표시
 * - FlightDetailPage의 오른쪽 디자인을 기반으로 재구성
 * - 좌석 선택 시 좌석 추가금(totalPrice) 반영
 */
const FlyRsvSumCard = ({
  selectedOutbound,
  selectedInbound,
  outboundTotalPrice, // ✅ 출발편 좌석 포함 합계
  inboundTotalPrice,  // ✅ 귀국편 좌석 포함 합계
  totalAmount,
}) => {
  const formatTime = (str) => {
    if (!str) return "";
    const d = new Date(str);
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  const formatDate = (str) => {
    if (!str) return "";
    const d = new Date(str);
    const day = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(
      d.getDate()
    ).padStart(2, "0")} (${day})`;
  };

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
        항공편 요약
      </Title>

      {!selectedOutbound && !selectedInbound ? (
        <Text type="secondary">선택된 항공편이 없습니다.</Text>
      ) : (
        <>
          {/* 출발편 */}
          {selectedOutbound && (
            <>
              <Text strong>출발편</Text>
              <div style={{ marginTop: 6 }}>
                <Text>{selectedOutbound.airlineNm}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {formatTime(selectedOutbound.depTime)}{" "}
                  {selectedOutbound.depAirportName} →{" "}
                  {formatTime(selectedOutbound.arrTime)}{" "}
                  {selectedOutbound.arrAirportName}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDate(selectedOutbound.depTime)} 출발
                </Text>
                <br />
                {/* ✅ 좌석 추가금 포함 금액 표시 */}
                <Text strong style={{ color: "#1677ff", fontSize: 15 }}>
                  ₩
                  {Number(
                    outboundTotalPrice ??
                    selectedOutbound.price ??
                    0
                  ).toLocaleString()}
                </Text>
              </div>
            </>
          )}

          {/* 귀국편 */}
          {selectedInbound && (
            <>
              <Divider style={{ margin: "14px 0" }} />
              <Text strong>귀국편</Text>
              <div style={{ marginTop: 6 }}>
                <Text>{selectedInbound.airlineNm}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {formatTime(selectedInbound.depTime)}{" "}
                  {selectedInbound.depAirportName} →{" "}
                  {formatTime(selectedInbound.arrTime)}{" "}
                  {selectedInbound.arrAirportName}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDate(selectedInbound.depTime)} 출발
                </Text>
                <br />
                {/* ✅ 좌석 추가금 포함 금액 표시 */}
                <Text strong style={{ color: "#1677ff", fontSize: 15 }}>
                  ₩
                  {Number(
                    inboundTotalPrice ??
                    selectedInbound.price ??
                    0
                  ).toLocaleString()}
                </Text>
              </div>
            </>
          )}

          <Divider />

          {/* 총 금액 */}
          <Text strong>총 금액</Text>
          <Title
            level={4}
            style={{ margin: 0, color: "#1677ff", fontWeight: 700 }}
          >
            ₩{Number(totalAmount ?? 0).toLocaleString()}
          </Title>
        </>
      )}
    </Card>
  );
};

export default FlyRsvSumCard;
