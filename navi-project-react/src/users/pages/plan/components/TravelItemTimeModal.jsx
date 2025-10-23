import React, { useState, useEffect } from "react";
import { Modal, TimePicker } from "antd";
import dayjs from "dayjs";

export default function TravelItemTimeModal({ open, onClose, item, onSave }) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    if (item?.startTime) {
      setTime(dayjs(item.startTime, "HH:mm"));
    } else {
      setTime(dayjs("10:00", "HH:mm"));
    }
  }, [item]);

  const handleOk = () => {
    if (!time) return;
    onSave(time.format("HH:mm"));
  };

  if (!item) return null;

  return (
    <Modal
      title={`⏰ ${item.title} 시작 시간 수정`}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="저장"
      cancelText="취소"
      centered
    >
      <div className="flex flex-col items-center mt-4">
        <p className="text-gray-600 mb-3 text-sm">새로운 시작 시간을 선택하세요.</p>
        <TimePicker
          format="HH:mm"
          minuteStep={5}
          value={time}
          onChange={(v) => setTime(v)}
          size="large"
        />
      </div>
    </Modal>
  );
}
