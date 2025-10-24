// 📁 src/users/pages/plan/components/TravelItemTimeModal.jsx
import React, { useRef, useState } from "react";
import { Modal, TimePicker } from "antd";
import dayjs from "dayjs";

export default function TravelItemTimeModal({
  open,
  onClose,
  onSave,
  tempStart,
  tempEnd,
  setTempStart,
  setTempEnd,
}) {
  const endPickerRef = useRef(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [openKey, setOpenKey] = useState(null);

  const getDisabledStartTime = (endTime) => {
    if (!endTime) return {};
    const endHour = endTime.hour();
    const endMinute = endTime.minute();
    return {
      disabledHours: () =>
        Array.from({ length: 24 }, (_, i) => i).filter((h) => h > endHour),
      disabledMinutes: (h) =>
        h === endHour
          ? Array.from({ length: 60 }, (_, i) => i).filter((m) => m >= endMinute)
          : [],
    };
  };

  const getDisabledEndTime = (startTime) => {
    if (!startTime) return {};
    const startHour = startTime.hour();
    const startMinute = startTime.minute();
    return {
      disabledHours: () =>
        Array.from({ length: 24 }, (_, i) => i).filter((h) => h < startHour),
      disabledMinutes: (h) =>
        h === startHour
          ? Array.from({ length: 60 }, (_, i) => i).filter((m) => m <= startMinute)
          : [],
    };
  };

  return (
    <Modal
      title="🕒 일정 시간 설정"
      open={open}
      onCancel={onClose}
      onOk={() => {
        const start = tempStart ? tempStart.format("HH:mm") : null;
        const end = tempEnd ? tempEnd.format("HH:mm") : null;
        onSave(start, end);
        onClose();
      }}
      okText="저장"
      cancelText="취소"
      centered
    >
      <div className="flex items-center gap-3 justify-center py-3">
        {/* 시작 시간 */}
        <TimePicker
          format="HH:mm"
          minuteStep={5}
          showNow={false}
          needConfirm={false}
          value={tempStart}
          open={openKey === "start"}
          onOpenChange={(open) => setOpenKey(open ? "start" : null)}
          onSelect={(v) => {
            if (selectedPart === null) {
              setSelectedPart("hour");
              setTempStart(v);
            } else if (selectedPart === "hour") {
              setTempStart(v);
              setSelectedPart(null);
              setOpenKey(null);
              setTimeout(() => endPickerRef.current?.focus(), 150);
            }
          }}
          placeholder="시작"
          disabledTime={() => getDisabledStartTime(tempEnd)}
        />
        <span>~</span>
        {/* 종료 시간 */}
        <TimePicker
          ref={endPickerRef}
          format="HH:mm"
          minuteStep={5}
          showNow={false}
          needConfirm={false}
          value={tempEnd}
          open={openKey === "end"}
          onOpenChange={(open) => setOpenKey(open ? "end" : null)}
          onSelect={(v) => {
            if (selectedPart === null) {
              setSelectedPart("hour");
              setTempEnd(v);
            } else if (selectedPart === "hour") {
              setTempEnd(v);
              setSelectedPart(null);
              setOpenKey(null);
            }
          }}
          placeholder="종료"
          disabledTime={() => getDisabledEndTime(tempStart)}
        />
      </div>

      <div className="text-xs text-gray-500 text-center mt-2">
        둘 다 비우면 시간 미지정으로 처리됩니다.
      </div>
    </Modal>
  );
}
