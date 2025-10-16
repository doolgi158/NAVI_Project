import React, { useState } from "react";
import { Modal, DatePicker, Button, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/ko";

export default function DateModal({ open, setDateRange, setStep }) {
  const [range, setRange] = useState([]);
  const disabledDate = (current) => current && current < dayjs().startOf("day");

  const handleNext = () => {
    if (!range?.[0]) return message.warning("날짜를 선택해주세요.");
    setDateRange(range);
    setStep(2);
  };

  return (
    <Modal open={open} centered closable={false} footer={null} width="60%"
      styles={{ body: { background: "#fff", borderRadius: 18, padding: 50, textAlign: "center" } }}>
      <h2 className="text-[#2F3E46] text-2xl font-bold mb-8">📅 여행 날짜를 선택하세요</h2>
      <DatePicker.RangePicker
        locale={dayjs.locale("ko")}
        value={range}
        onChange={setRange}
        disabledDate={disabledDate}
        style={{ width: "80%", height: 52, fontSize: 17, borderRadius: 10 }}
      />
      <div className="mt-10 flex justify-center gap-6">
        <Button size="large" style={{ background: "#ECECEC", color: "#2F3E46", borderRadius: 10 }}
          onClick={() => setStep(1)}>닫기</Button>
        <Button type="primary" size="large" style={{ background: "#2F3E46", borderRadius: 10 }}
          onClick={handleNext}>선택 완료</Button>
      </div>
    </Modal>
  );
}
