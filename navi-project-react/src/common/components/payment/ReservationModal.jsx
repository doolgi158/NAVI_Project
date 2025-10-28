import React from "react";
import { Modal, Descriptions, Tag } from "antd";

const statusColorMap = {
  PENDING: "default",
  PAID: "green",
  CANCELLED: "magenta",
  REFUNDED: "red",
  FAILED: "volcano",
};

const ReservationModal = ({ open, onClose, data, rsvType }) => {
  if (!data) return null;

  const commonInfo = [
    {
      label: "예약번호",
      value: data.reserveId || data.frsvId || data.drsvId,
    },
    {
      label: "상태",
      value: (
        <Tag color={statusColorMap[data.status || data.rsvStatus]}>
          {data.status || data.rsvStatus}
        </Tag>
      ),
    },
  ];

  const renderTypeSpecific = () => {
    switch (rsvType) {
      case "ACC":
        return (
          <>
            <Descriptions.Item label="숙소명">{data.title}</Descriptions.Item>
            <Descriptions.Item label="객실명">{data.roomName}</Descriptions.Item>
            <Descriptions.Item label="체크인">{data.startDate}</Descriptions.Item>
            <Descriptions.Item label="체크아웃">{data.endDate}</Descriptions.Item>
            <Descriptions.Item label="숙박일수">{data.nights}</Descriptions.Item>
            <Descriptions.Item label="인원">{data.guestCount}</Descriptions.Item>
            <Descriptions.Item label="예약자">{data.reserverName}</Descriptions.Item>
            <Descriptions.Item label="연락처">{data.reserverTel}</Descriptions.Item>
            <Descriptions.Item label="이메일">{data.reserverEmail}</Descriptions.Item>
          </>
        );
      case "FLY":
        return (
          <>
            <Descriptions.Item label="항공편">{data.flightId}</Descriptions.Item>
            <Descriptions.Item label="출발일">{data.depTime}</Descriptions.Item>
            <Descriptions.Item label="좌석번호">{data.seat?.seatNo}</Descriptions.Item>
            <Descriptions.Item label="탑승객 정보">
              {data.passengersJson || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="결제금액">
              ₩{data.totalPrice?.toLocaleString()}
            </Descriptions.Item>
          </>
        );
      case "DLV":
        return (
          <>
            <Descriptions.Item label="출발지">{data.startAddr}</Descriptions.Item>
            <Descriptions.Item label="도착지">{data.endAddr}</Descriptions.Item>
            <Descriptions.Item label="배송일">{data.deliveryDate}</Descriptions.Item>
            <Descriptions.Item label="가방정보">{data.bagsJson}</Descriptions.Item>
            <Descriptions.Item label="결제금액">
              ₩{data.totalPrice?.toLocaleString()}
            </Descriptions.Item>
          </>
        );
      default:
        return <Descriptions.Item>지원되지 않는 유형입니다.</Descriptions.Item>;
    }
  };

  return (
    <Modal
      title={`예약 상세 (${rsvType})`}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={650}
      className="rounded-2xl"
    >
      <Descriptions bordered column={1} size="small" labelStyle={{ width: "150px" }}>
        {commonInfo.map((item) => (
          <Descriptions.Item key={item.label} label={item.label}>
            {item.value}
          </Descriptions.Item>
        ))}
        {renderTypeSpecific()}
      </Descriptions>
    </Modal>
  );
};

export default ReservationModal;
