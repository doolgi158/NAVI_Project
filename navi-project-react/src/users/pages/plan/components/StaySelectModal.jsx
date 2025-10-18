import React, { useState, useEffect } from "react";
import { Modal, Button, message } from "antd";

export default function StaySelectModal({
  open,
  onClose,
  stay,
  days,
  onSelectDates,
  resetTrigger,
  stayPlans,
  stays,
  setStayPlans,
  setSelectedStays,
}) {
  const [selectedDates, setSelectedDates] = useState([]);

  useEffect(() => setSelectedDates([]), [resetTrigger]);
  useEffect(() => {
    if (open && stay?.name) {
      setSelectedDates([...(stayPlans?.[stay.name] || [])]);
    }
  }, [open, stay?.name, stayPlans]);

  /** ✅ 날짜 클릭 시 로직 */
  const toggleDate = (dateStr) => {
    const assigned = Object.entries(stayPlans).find(([name, dates]) =>
      dates.includes(dateStr)
    );

    // ✅ 이미 다른 숙소에 예약된 날짜인 경우
    if (assigned && assigned[0] !== stay.name) {
      const assignedName = assigned[0];

      Modal.confirm({
        title: "숙소 예약 해제",
        content: `${assignedName}의 ${dateStr} 숙박 일정을 해제하시겠습니까?`,
        okText: "해제",
        cancelText: "취소",
        centered: true,
        onOk: () => {
          const updated = { ...stayPlans };
          // 해당 날짜를 해당 숙소에서 제거
          updated[assignedName] = updated[assignedName].filter(
            (d) => d !== dateStr
          );
          // 해당 숙소에 더 이상 날짜가 없으면 삭제
          if (updated[assignedName].length === 0) {
            delete updated[assignedName];
          }

          // selectedStays 동기화
          const active = Object.keys(updated).filter((k) => updated[k].length);
          setStayPlans(updated);
          setSelectedStays(stays.filter((s) => active.includes(s.name)));
          message.success(`${assignedName}의 ${dateStr} 숙박이 해제되었습니다.`);
        },
      });
      return;
    }

    // ✅ 현재 숙소에 대한 날짜 토글
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const handleSelectComplete = () => {
    onSelectDates(stay, [...selectedDates]);
    onClose();
  };

  return (
    <Modal
      open={open}
      centered
      onCancel={handleSelectComplete}
      footer={null}
      width={600}
      styles={{
        body: {
          background: "#fff",
          borderRadius: 16,
          padding: "40px 30px",
          textAlign: "center",
        },
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#222] mb-1">
          숙박하실 날짜를 선택해주세요
        </h2>
        <Button
          size="small"
          type="default"
          className="rounded-md text-sm font-medium"
          onClick={() => {
            const selectable = days.slice(0, -1).map((d) => d.format("MM/DD"));
            const all = selectable.every((d) => selectedDates.includes(d));
            setSelectedDates(all ? [] : selectable);
          }}
        >
          전체 {selectedDates.length === days.length - 1 ? "해제" : "선택"}
        </Button>
      </div>

      <p className="text-gray-500 mb-8">{stay?.name || "선택된 숙소 없음"}</p>

      {/* ✅ 날짜 선택 영역 */}
      <div className="grid grid-cols-4 gap-4 justify-center items-center mb-10">
        {days.slice(0, -1).map((d) => {
          const dateStr = d.format("MM/DD");
          const selected = selectedDates.includes(dateStr);

          const assigned = Object.entries(stayPlans).find(([name, ds]) =>
            ds.includes(dateStr)
          );
          const booked = !!assigned;
          const bookedStayName = assigned ? assigned[0] : null;
          const bookedStay = booked
            ? stays.find((s) => s.name === bookedStayName)
            : null;

          return (
            <div
              key={dateStr}
              onClick={() => toggleDate(dateStr)}
              className={`relative flex flex-col items-center justify-center border-2 rounded-xl p-3 cursor-pointer transition-all ${booked
                  ? bookedStayName === stay?.name
                    ? "border-[#6846FF] bg-[#6846FF]/10"
                    : "border-red-300 bg-red-50"
                  : selected
                    ? "border-[#6846FF] bg-[#6846FF]/10"
                    : "border-gray-300 hover:border-[#6846FF]"
                }`}
            >
              <div
                className={`absolute -top-3 text-xs font-bold px-2 py-1 rounded-full ${booked
                    ? bookedStayName === stay?.name
                      ? "bg-[#6846FF] text-white"
                      : "bg-red-500 text-white"
                    : selected
                      ? "bg-[#6846FF] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
              >
                {dateStr}
              </div>

              <div className="w-16 h-16 rounded-md overflow-hidden flex items-center justify-center text-gray-400 text-2xl mt-3">
                {booked && bookedStayName !== stay?.name ? (
                  <img
                    src={bookedStay?.img}
                    alt={bookedStayName}
                    className="w-full h-full object-cover"
                  />
                ) : selected || bookedStayName === stay?.name ? (
                  <i className="bi bi-check-circle text-[#6846FF]"></i>
                ) : (
                  <i className="bi bi-plus-circle"></i>
                )}
              </div>

              <p
                className={`text-xs mt-2 font-medium ${booked
                    ? bookedStayName === stay?.name
                      ? "text-[#6846FF]"
                      : "text-red-600"
                    : "text-gray-500"
                  }`}
              >
                {booked
                  ? bookedStayName === stay?.name
                    ? "현재 선택됨"
                    : `${bookedStayName} 예약됨`
                  : selected
                    ? "선택됨"
                    : "선택 가능"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Button
          onClick={handleSelectComplete}
          type="primary"
          className="h-11 px-10 rounded-lg font-semibold text-sm"
          style={{ background: "#6846FF", border: "none" }}
        >
          선택 완료
        </Button>
        <Button
          onClick={handleSelectComplete}
          className="h-11 px-10 rounded-lg font-semibold text-sm"
          style={{ background: "#000", color: "#fff", border: "none" }}
        >
          닫기
        </Button>
      </div>
    </Modal>
  );
}
