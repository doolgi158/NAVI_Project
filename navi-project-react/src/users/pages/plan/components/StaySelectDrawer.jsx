import React, { useEffect, useState } from "react";
import { List, Button, Empty, message, Modal } from "antd";
import axios from "axios";
import TitleDateDisplay from "./TitleDateDisplay";
import { API_SERVER_HOST } from "@/common/api/naviApi";

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
  resetAllStays = () => { },
}) {
  const [imageMap, setImageMap] = useState({});
  const FALLBACK_IMG = `${API_SERVER_HOST}/images/common/default_acc.jpg`;

  /** ✅ 숙소별 이미지 불러오기 (accId 기준) */
  useEffect(() => {
    const fetchImages = async () => {
      if (!stays || stays.length === 0) return;
      const results = {};

      await Promise.all(
        stays.map(async (item) => {
          try {
            // 숙소 식별자 확인 (accId가 ACC001 형태인지 반드시 확인)
            const targetType = "ACC";
            const targetId = item.accId; // ex) "ACC001"

            const res = await axios.get(`${API_SERVER_HOST}/api/images`, {
              params: { targetType, targetId },
            });

            const list = res.data?.data || [];
            if (list.length > 0) {
              // path 값이 "/images/acc/xxxx.png" 형태로 내려옴
              const path = list[0].path.startsWith("/images/")
                ? `${API_SERVER_HOST}${list[0].path}`
                : `${API_SERVER_HOST}/images/acc/${list[0].path}`;
              results[item.accId] = path;
              item.img = path;
            }
          } catch (err) {
            console.warn(`❌ 이미지 로드 실패: ${item.accId}`, err);
          }
        })
      );

      setImageMap(results);
    };

    fetchImages();
  }, [stays]);

  return (
    <div className="flex h-full w-full">
      {/* 왼쪽: 숙소 리스트 */}
      <div className="w-1/2 bg-[#FDFCF9] border-r border-gray-200 flex flex-col">
        <TitleDateDisplay title={title} dateRange={dateRange} />
        <h3 className="font-semibold text-[#2F3E46] mb-3 text-lg pl-4 mt-4">
          🏨 숙소 선택
        </h3>

        <div className="flex-1 overflow-y-auto custom-scroll pb-4 pr-4 pl-4">
          <List
            dataSource={stays}
            renderItem={(item) => (
              <List.Item
                onClick={() => {
                  if (!hasNights)
                    return message.info("1일 여행은 숙소 설정이 필요하지 않습니다.");
                  setSelectedStayTarget(item);
                  setShowStayModal(true);
                }}
                className={`cursor-pointer ${!hasNights ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                <div className="flex justify-between w-full items-center bg-white px-4 py-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.accImage || FALLBACK_IMG}
                      alt={item.title}
                      className="w-12 h-12 rounded-md object-cover"
                      onError={(e) => (e.target.src = FALLBACK_IMG)}
                    />
                    <div>
                      <p className="font-semibold text-sm text-[#2F3E46] mb-0">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        {item.address || "주소 정보 없음"}
                      </p>
                    </div>
                  </div>
                  {(stayPlans?.[item.accId]?.length ?? 0) > 0 ? (
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
            <h3 className="text-lg font-semibold text-[#2F3E46]">
              🏨 숙박 일정 요약
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              총 {Math.max((days?.length || 1) - 1, 0)}박 /{" "}
              {
                Object.keys(stayPlans).filter(
                  (k) => (stayPlans?.[k]?.length ?? 0) > 0
                ).length
              }개의 숙소
            </p>
          </div>
          <Button
            type="link"
            className="text-red-500 hover:text-red-600 font-semibold"
            onClick={() => resetAllStays()}
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
              {(days || [])
                .slice(0, (days?.length || 1) - 1)
                .map((d, idx) => {
                  const nextDay = days[idx + 1];
                  const rangeText = `${d.format("MM.DD(ddd)")} ~ ${nextDay.format(
                    "MM.DD(ddd)"
                  )}`;
                  const dateStr = d.format("MM/DD");

                  const assigned = Object.entries(stayPlans).find(([_, dates]) =>
                    dates.includes(dateStr)
                  );
                  const assignedStayId = assigned ? assigned[0] : null;
                  const stayData = stays.find((s) => s.accId === assignedStayId);

                  const displayStay = stayData || {
                    accId: `default-${idx}`,
                    title: "숙소 미정",
                    address: "클릭하여 숙소 선택",
                  };

                  return (
                    <div
                      key={d.format("YYYY-MM-DD")}
                      className="border border-gray-200 rounded-xl p-4 bg-[#FAFAFA]"
                    >
                      <div className="text-sm font-semibold text-[#2F3E46] mb-3">
                        {rangeText}
                      </div>
                      <div
                        className="flex items-center justify-between bg-white border rounded-lg p-3 hover:shadow-sm cursor-pointer transition"
                        onClick={() => {
                          if (displayStay.title === "숙소 미정") {
                            message.info("좌측 목록에서 숙소를 선택해주세요.");
                            return;
                          }

                          const assignedStayId = Object.entries(stayPlans).find(
                            ([_, dates]) => dates.includes(dateStr)
                          )?.[0];

                          if (assignedStayId) {
                            Modal.confirm({
                              title: "숙소 선택 해제",
                              content: `선택된 숙소의 숙박 일정을 취소하시겠습니까?`,
                              okText: "해제",
                              cancelText: "취소",
                              centered: true,
                              onOk: () => {
                                const updated = { ...stayPlans };
                                updated[assignedStayId] = updated[
                                  assignedStayId
                                ].filter((d) => d !== dateStr);
                                if (updated[assignedStayId].length === 0)
                                  delete updated[assignedStayId];

                                setStayPlans(updated);
                                const active = Object.keys(updated).filter(
                                  (k) => updated[k].length
                                );
                                setSelectedStays(
                                  stays.filter((s) => active.includes(s.accId))
                                );
                                message.success(`숙소 일정이 해제되었습니다.`);
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
                            <img
                              src={displayStay.accImage || FALLBACK_IMG}
                              alt={displayStay.title}
                              className="w-full h-full object-cover"
                              onError={(e) => (e.target.src = FALLBACK_IMG)}
                            />
                          </div>
                          <div className="flex flex-col ml-3 min-w-[140px]">
                            <p
                              className={`text-sm font-semibold ${displayStay.title === "숙소 미정"
                                ? "text-gray-500 italic"
                                : "text-[#2F3E46]"
                                }`}
                            >
                              {displayStay.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {displayStay.address}
                            </p>
                          </div>
                        </div>
                        {displayStay.title !== "숙소 미정" && (
                          <i className="bi bi-pencil-square text-xl text-[#2F3E46]"></i>
                        )}
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
