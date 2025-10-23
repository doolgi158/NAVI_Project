import React, { useState } from "react";
import { Modal, DatePicker, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";

export default function DateModal({ open, setDateRange, setStep, resetAll, isEditMode = false, meta, setMeta, days, setDays }) {
  const [range, setRange] = useState([]);
  const disabledDate = (current) => current && current < dayjs().startOf("day");
  const navigate = useNavigate();

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
        <Button
          size="large"
          style={{ background: "#ECECEC", color: "#2F3E46", borderRadius: 10 }}
          onClick={() => {
            if (isEditMode) {
              // 수정 모드에서는 단순히 닫기
              setStep(null);
            } else {
              // 일반 생성 모드에서는 기존 동작 유지
              navigate("/plans");
            }
          }}
        >
          {isEditMode ? "취소" : "계획 취소"}
        </Button>

        <Button type="primary" size="large" style={{ background: "#2F3E46", borderRadius: 10 }}
          onClick={() => {
            if (!range || !range[0]) return message.warning("날짜를 선택해주세요.");
            if (isEditMode) {
              const [newStart, newEnd] = range;
              const diff = newEnd.diff(newStart, "day") + 1;

              Modal.confirm({
                title: "여행 기간 변경",
                content: (
                  <>
                    여행 기간을 변경하면 기존 일정이 새 날짜 수에 맞게 다시 분배됩니다.<br />
                    계속하시겠습니까?
                  </>
                ),
                okText: "확인",
                cancelText: "취소",
                centered: true,
                onOk: () => {
                  // 기존 일정(flatten, 공항 제외)
                  const allItems = days
                    .flatMap((d) => d.items || [])
                    .filter((it) => !it.fixed);

                  const newDays = Array.from({ length: diff }, (_, i) => {
                    const dateISO = newStart.add(i, "day").format("YYYY-MM-DD");
                    return { dateISO, items: [] };
                  });

                  // 1/n 분배
                  if (allItems.length > 0) {
                    const buckets = Array.from({ length: diff }, () => []);
                    allItems.forEach((item, idx) => {
                      buckets[idx % diff].push(item);
                    });

                    for (let i = 0; i < diff; i++) {
                      const dayItems = buckets[i].map((it) => ({
                        ...it,
                        startTime: "- : -",
                        endTime: "- : -",
                        __manual__: false,
                      }));

                      if (i === 0) {
                        dayItems.unshift({
                          type: "poi",
                          title: "제주공항 도착",
                          icon: "bi bi-airplane",
                          fixed: true,
                          startTime: "10:00",
                          endTime: "10:00",
                        });
                      }
                      if (i === diff - 1) {
                        dayItems.push({
                          type: "poi",
                          title: "제주공항 출발",
                          icon: "bi bi-airplane",
                          fixed: true,
                          startTime: "22:00",
                          endTime: "22:00",
                        });
                      }
                      newDays[i].items = dayItems;
                    }
                  }

                  setMeta((prev) => ({
                    ...prev,
                    startDate: newStart.format("YYYY-MM-DD"),
                    endDate: newEnd.format("YYYY-MM-DD"),
                  }));
                  setDays(newDays);
                  message.success("여행 기간이 변경되었습니다.");
                  setStep(null); // 닫기용
                },
              });
            } else {
              resetAll();
              setDateRange(range);
              setStep(2);
            }
          }}
        >
          선택 완료
        </Button>
      </div>
    </Modal>
  );
}
