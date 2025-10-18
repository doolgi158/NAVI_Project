import React from "react";
import { List, Button, Empty, message } from "antd";
import TitleDateDisplay from "./TitleDateDisplay";

export default function StaySelectDrawer({
  stays = [],
  title = "",
  dateRange = [],
  days = [],
  hasNights = false,
  stayPlans = {},
  setStayPlans = () => { },
  selectedStays = [],
  setSelectedStays = () => { },
  setSelectedStayTarget = () => { },
  setShowStayModal = () => { },
  setModalResetTrigger = () => { },
}) {
  return (
    <div className="flex h-full w-full">
      {/* 왼쪽: 숙소 리스트 */}
      <div className="w-1/2 bg-[#FDFCF9] border-r border-gray-200 flex flex-col">
        <TitleDateDisplay title={title} dateRange={dateRange} />
        <h3 className="font-semibold text-[#2F3E46] mb-3 text-lg pl-4 mt-4">🏨 숙소 선택</h3>
        <div className="flex-1 overflow-y-auto custom-scroll pb-4 pr-4 pl-4">
          <List
            dataSource={stays}
            renderItem={(item) => (
              <List.Item
                onClick={() => {
                  if (!hasNights) return message.info("1일 여행은 숙소 설정이 필요하지 않습니다.");
                  setSelectedStayTarget(item);
                  setShowStayModal(true);
                }}
                className={`cursor-pointer ${!hasNights ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex justify-between w-full items-center bg-white px-4 py-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <img src={item.img} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                    <div>
                      <p className="font-semibold text-sm text-[#2F3E46] mb-0">{item.name}</p>
                      <p className="text-xs text-gray-500 mb-1">{item.desc}</p>
                    </div>
                  </div>
                  {(stayPlans?.[item.name]?.length ?? 0) > 0 ? (
                    <i className="bi bi-check-circle-fill text-[#6846FF] text-xl"></i>
                  ) : (
                    <i className="bi bi-calendar-plus text-[#2F3E46] text-xl"></i>
                  )}
                </div>
              </List.Item>
            )}
          />
        </div>
      </div>

      {/* 오른쪽: 숙소 요약 */}
      <div className="w-1/2 bg-[#FFFFFF] p-5 flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-semibold text-[#2F3E46]">🏨 숙박 일정 요약</h3>
            <p className="text-sm text-gray-500 mt-1">
              총 {Math.max((days?.length || 1) - 1, 0)}박 /{" "}
              {Object.keys(stayPlans).filter((k) => (stayPlans?.[k]?.length ?? 0) > 0).length}개의 숙소
            </p>
          </div>
          <Button
            type="link"
            className="text-red-500 hover:text-red-600 font-semibold"
            onClick={() => {
              setStayPlans({});
              setSelectedStays([]);
              setModalResetTrigger((p) => p + 1);
            }}
          >
            설정 초기화
          </Button>
        </div>

        <p className="text-gray-500 text-sm mb-6 border-b pb-4">
          숙소를 아직 정하지 못한 경우, 추후 설정 가능합니다.
        </p>

        <div className="flex-1 overflow-y-auto custom-scroll pb-4 pr-4 mt-4">
          {(selectedStays?.length ?? 0) > 0 || hasNights ? (
            <div className="space-y-6">
              {(days || []).slice(0, (days?.length || 1) - 1).map((d, idx) => {
                const nextDay = days[idx + 1];
                const rangeText = `${d.format("MM.DD(ddd)")} ~ ${nextDay.format("MM.DD(ddd)")}`;
                const dateStr = d.format("MM/DD");
                const assigned = Object.entries(stayPlans).find(([_, dates]) => dates.includes(dateStr));
                const assignedStayName = assigned ? assigned[0] : null;
                const stayData = stays.find((s) => s.name === assignedStayName);
                const displayStay = stayData || {
                  id: `default-${idx}`,
                  name: "숙소 미정",
                  desc: "클릭하여 숙소 선택",
                  img: "https://placehold.co/100x100?text=?",
                };

                return (
                  <div key={d.format("YYYY-MM-DD")} className="border border-gray-200 rounded-xl p-4 bg-[#FAFAFA]">
                    <div className="text-sm font-semibold text-[#2F3E46] mb-3">{rangeText}</div>
                    <div
                      className="flex items-center justify-between bg-white border rounded-lg p-3 hover:shadow-sm cursor-pointer transition"
                      onClick={() => {
                        if (displayStay.name === "숙소 미정") {
                          message.info("좌측 목록에서 숙소를 선택해주세요.");
                          return;
                        }

                        // ✅ 이미 선택된 숙소를 다시 클릭하면 해제
                        const dateStr = d.format("MM/DD");
                        const assignedStayName = Object.entries(stayPlans).find(([_, dates]) => dates.includes(dateStr))?.[0];

                        if (assignedStayName) {
                          Modal.confirm({
                            title: "숙소 선택 해제",
                            content: `${assignedStayName}의 숙박 일정을 취소하시겠습니까?`,
                            okText: "해제",
                            cancelText: "취소",
                            centered: true,
                            onOk: () => {
                              const updated = { ...stayPlans };
                              // 해당 숙소에서 날짜 제거
                              updated[assignedStayName] = updated[assignedStayName].filter((d) => d !== dateStr);
                              // 빈 배열이면 숙소 자체 삭제
                              if (updated[assignedStayName].length === 0) delete updated[assignedStayName];
                              setStayPlans(updated);

                              // selectedStays 동기화
                              const active = Object.keys(updated).filter((k) => updated[k].length);
                              setSelectedStays(stays.filter((s) => active.includes(s.name)));
                              message.success(`${assignedStayName} 숙박이 해제되었습니다.`);
                            },
                          });
                          return;
                        }

                        setSelectedStayTarget(stayData);
                        setShowStayModal(true);
                      }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-7 h-7 rounded-full bg-[#EAEAEA] text-center text-xs font-semibold text-gray-700 leading-[28px]">
                          {idx + 1}
                        </div>
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <img src={displayStay.img} alt={displayStay.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col ml-3 min-w-[140px]">
                          <p className={`text-sm font-semibold ${displayStay.name === "숙소 미정" ? "text-gray-500 italic" : "text-[#2F3E46]"}`}>
                            {displayStay.name}
                          </p>
                          <p className="text-xs text-gray-500">{displayStay.desc}</p>
                        </div>
                      </div>
                      {displayStay.name !== "숙소 미정" && <i className="bi bi-pencil-square text-xl text-[#2F3E46]"></i>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty description="좌측 목록에서 숙소를 선택하여 일정을 설정하세요." />
          )}
        </div>
      </div>
    </div>
  );
}
