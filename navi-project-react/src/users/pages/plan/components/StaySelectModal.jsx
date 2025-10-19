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
    if (open && stay?.accId) {
      setSelectedDates([...(stayPlans?.[stay.accId] || [])]);
    }
  }, [open, stay?.accId, stayPlans]);

  /** ✅ 날짜 클릭 시 로직 */
  const toggleDate = (dateStr) => {
    const assigned = Object.entries(stayPlans).find(([id, dates]) =>
      dates.includes(dateStr)
    );

    // ✅ 이미 다른 숙소에 예약된 날짜인 경우
    if (assigned && assigned[0] !== stay.accId) {
      const assignedId = assigned[0];
      const assignedStay = stays.find((s) => s.accId === assignedId);
      Modal.confirm({
        title: "숙소 예약 해제",
        content: `${assignedStay?.title || "숙소"}의 ${dateStr} 숙박 일정을 해제하시겠습니까?`,
        okText: "해제",
        cancelText: "취소",
        centered: true,
        onOk: () => {
          const updated = { ...stayPlans };
          updated[assignedId] = updated[assignedId].filter((d) => d !== dateStr);
          if (updated[assignedId].length === 0) delete updated[assignedId];

          const active = Object.keys(updated).filter((k) => updated[k].length);
          setStayPlans(updated);
          setSelectedStays(stays.filter((s) => active.includes(s.accId)));
          message.success(`${assignedStay?.title || "숙소"}의 숙박이 해제되었습니다.`);
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

      <p className="text-gray-500 mb-8">{stay?.title || "선택된 숙소 없음"}</p>

      <div className="grid grid-cols-4 gap-4 justify-center items-center mb-10">
        {days.slice(0, -1).map((d) => {
          const dateStr = d.format("MM/DD");
          const selected = selectedDates.includes(dateStr);

          const assigned = Object.entries(stayPlans).find(([id, ds]) =>
            ds.includes(dateStr)
          );
          const booked = !!assigned;
          const bookedStayId = assigned ? assigned[0] : null;
          const bookedStay = booked
            ? stays.find((s) => s.accId === bookedStayId)
            : null;

          return (
            <div
              key={dateStr}
              onClick={() => toggleDate(dateStr)}
              className={`relative flex flex-col items-center justify-center border-2 rounded-xl p-3 cursor-pointer transition-all ${booked
                  ? bookedStayId === stay?.accId
                    ? "border-[#6846FF] bg-[#6846FF]/10"
                    : "border-red-300 bg-red-50"
                  : selected
                    ? "border-[#6846FF] bg-[#6846FF]/10"
                    : "border-gray-300 hover:border-[#6846FF]"
                }`}
            >
              <div
                className={`absolute -top-3 text-xs font-bold px-2 py-1 rounded-full ${booked
                    ? bookedStayId === stay?.accId
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
                {booked && bookedStayId !== stay?.accId ? (
                  <img
                    src={
                      bookedStay?.accImages && bookedStay.accImages.length > 0
                        ? bookedStay.accImages[0].startsWith("http")
                          ? bookedStay.accImages[0]
                          : `http://localhost:8080${bookedStay.accImages[0]}`
                        : "https://placehold.co/100x100?text=No+Image"
                    }
                    alt={bookedStay?.title}
                    className="w-full h-full object-cover"
                  />
                ) : selected || bookedStayId === stay?.accId ? (
                  <i className="bi bi-check-circle text-[#6846FF]"></i>
                ) : (
                  <i className="bi bi-plus-circle"></i>
                )}
              </div>

              <p
                className={`text-xs mt-2 font-medium ${booked
                    ? bookedStayId === stay?.accId
                      ? "text-[#6846FF]"
                      : "text-red-600"
                    : "text-gray-500"
                  }`}
              >
                {booked
                  ? bookedStayId === stay?.accId
                    ? "현재 선택됨"
                    : `${bookedStay?.title} 예약됨`
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
