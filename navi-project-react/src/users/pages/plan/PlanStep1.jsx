import React, { useState } from "react";
import MainLayout from "../../layout/MainLayout";
import CustomCard from "@/common/components/CustomCard";
import CustomButton from "@/common/components/CustomButton";
import CustomCalendar from "@/common/components/CustomCalendar";
import { format, isValid } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function PlanStep1(){
  const [range, setRange] = useState({ from: null, to: null });
  const navigate = useNavigate();

  // ✅ 날짜 포맷 안전 처리
  const safeFormat = (date, pattern = "yyyy.MM.dd") => {
    if (!date || !isValid(date)) return "";
    try {
      return format(date, pattern);
    } catch {
      return "";
    }
  };

  // ✅ 여행기간 표시용 문자열
  const displayRange =
    range.from && range.to
      ? `${safeFormat(range.from)} ~ ${safeFormat(range.to)}`
      : range.from
      ? `${safeFormat(range.from)}`
      : "";

  // ✅ n박 n일 계산
  const getDuration = () => {
    if (!range.from) return "";
    const start = range.from;
    const end = range.to || range.from;
    const nights = Math.max(
      0,
      Math.floor((end - start) / (1000 * 60 * 60 * 24))
    );
    const days = nights + 1;
    return ` (${nights}박 ${days}일)`;
  };

  // ✅ 다음 단계 이동
  const handleNext = () => {
    if (!range.from) {
      alert("여행 시작일을 선택해주세요!");
      return;
    }
    const startDate = safeFormat(range.from, "yyyy-MM-dd");
    const endDate = range.to
      ? safeFormat(range.to, "yyyy-MM-dd")
      : startDate;

    navigate("/plans/step2", {
      state: { startDate, endDate },
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center py-10">
        {/* 상단 안내 */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#0A3D91]">여행 날짜 선택</h1>

          {/* ✅ 날짜 1개라도 선택되면 안내문 사라짐 */}
          {!range.from ? (
            <p className="text-gray-600 mt-2 text-sm">
              시작일과 종료일을 선택하세요
            </p>
          ) : (
            <div className="mt-4 bg-blue-50 border border-blue-100 px-6 py-3 rounded-lg inline-block">
              <p className="text-[#0A3D91] font-semibold text-lg">
                여행 기간: {displayRange}
                {getDuration()}
              </p>
            </div>
          )}
        </div>

        {/* 달력 영역 */}
        <CustomCard className="w-[800px] text-center">
          <CustomCalendar onSelectRange={setRange} />
        </CustomCard>

        {/* 다음 버튼 */}
        {range.from && (
          <div className="mt-8">
            <CustomButton onClick={handleNext}>날짜 설정 완료</CustomButton>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
