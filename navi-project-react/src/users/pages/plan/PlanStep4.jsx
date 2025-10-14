import React from "react";
import MainLayout from "../../layout/MainLayout";
import CustomCard from "@/common/components/CustomCard";
import CustomButton from "@/common/components/CustomButton";
import { useNavigate, useLocation } from "react-router-dom";
import { format, differenceInDays } from "date-fns";

export default function PlanStep4() {
  const navigate = useNavigate();
  const location = useLocation();
  const { startDate, endDate, travelName, planItems } = location.state || {};

  // ✅ 날짜 형식 정리
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "yyyy.MM.dd");
    } catch {
      return dateStr;
    }
  };

  // ✅ 여행 기간 계산
  const getTripDuration = () => {
    if (!startDate) return "";
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;
    const nights = Math.max(0, differenceInDays(end, start));
    const days = nights + 1;
    return `${nights}박 ${days}일`;
  };

  // ✅ 완료 버튼
  const handleFinish = () => {
    alert("여행 일정이 저장되었습니다! ✈️");
    navigate("/plans/main");
  };

  // ✅ 이전 단계로 돌아가기
  const handleBack = () => {
    navigate("/plans/step3", {
      state: { startDate, endDate, travelName, planItems },
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center py-10">
        {/* 상단 타이틀 */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#0A3D91]">
            여행 일정 검토
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            선택한 여행 정보를 확인해주세요
          </p>
        </div>

        {/* 일정 요약 카드 */}
        <CustomCard className="w-[800px] text-left">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#0A3D91] mb-2">
              🗓️ 여행 기간
            </h2>
            <p className="text-gray-700">
              {formatDate(startDate)} ~ {formatDate(endDate)} ({getTripDuration()})
            </p>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#0A3D91] mb-2">
              📍 여행지
            </h2>
            <p className="text-gray-700">{travelName || "선택된 여행지가 없습니다."}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#0A3D91] mb-2">
              🧭 여행 일정
            </h2>
            {planItems && planItems.length > 0 ? (
              <ul className="space-y-2">
                {planItems.map((item, index) => (
                  <li
                    key={index}
                    className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg text-gray-800"
                  >
                    {index + 1}. {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">추가된 일정이 없습니다.</p>
            )}
          </div>
        </CustomCard>

        {/* 하단 버튼 영역 */}
        <div className="mt-8 flex gap-4">
          <CustomButton onClick={handleBack} className="bg-gray-400 hover:bg-gray-500">
            이전 단계
          </CustomButton>
          <CustomButton onClick={handleFinish}>일정 완료</CustomButton>
        </div>
      </div>
    </MainLayout>
  );
}
