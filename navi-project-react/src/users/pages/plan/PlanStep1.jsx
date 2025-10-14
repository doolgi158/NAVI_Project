import React, { useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ko } from "date-fns/locale";
import { format, isBefore, isValid } from "date-fns";
import { useNavigate } from "react-router-dom";

const NAVI_BLUE = "#0A3D91";

const PlanStep1 = () => {
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const navigate = useNavigate();

  /** ✅ 날짜 선택 로직 (다시 클릭 시 리셋) */
  const handleSelect = (date) => {
    if (!range.from && !range.to) {
      setRange({ from: date, to: undefined });
      return;
    }

    if (range.from && !range.to) {
      if (isBefore(date, range.from)) {
        setRange({ from: date, to: undefined });
      } else if (date.getTime() === range.from.getTime()) {
        setRange({ from: undefined, to: undefined });
      } else {
        setRange({ from: range.from, to: date });
      }
      return;
    }

    if (range.from && range.to) {
      setRange({ from: date, to: undefined });
    }
  };

  /** ✅ 안전한 날짜 포맷 */
  const safeFormat = (date, pattern = "yyyy.MM.dd") => {
    if (!date || !isValid(date)) return "";
    try {
      return format(date, pattern);
    } catch {
      return "";
    }
  };

  /** ✅ 여행기간 표시 */
  const displayRange =
    safeFormat(range.from) +
    (range.to ? " ~ " + safeFormat(range.to) : "");

  /** ✅ 다음 단계 이동 */
  const handleNext = () => {
    if (!range.from || !isValid(range.from)) {
      alert("여행 시작일을 선택해주세요!");
      return;
    }

    const startDate = safeFormat(range.from, "yyyy-MM-dd");
    const endDate =
      range.to && isValid(range.to)
        ? safeFormat(range.to, "yyyy-MM-dd")
        : startDate;

    navigate("/plans/step2", { state: { startDate, endDate } });
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center py-10">
        {/* 상단 캡션 */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#0A3D91]">
            여행 날짜 선택
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            시작일과 종료일을 선택하세요
          </p>

          {range.from && (
            <div className="mt-4 bg-blue-50 border border-blue-100 px-6 py-3 rounded-lg inline-block">
              <p className="text-[#0A3D91] font-semibold text-lg">
                여행 기간: {displayRange || "날짜를 선택하세요"}
              </p>
            </div>
          )}
        </div>

        <Card className="p-6 w-[800px] shadow-md text-center">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              onSelect={handleSelect}
              locale={ko}
              numberOfMonths={2}
              monthLayout="horizontal"
              className="flex flex-row justify-center gap-4"
              classNames={{
                months: "flex flex-row space-x-4 justify-center",
                month: "space-y-4",
                caption_label: "text-[#0A3D91] font-semibold",
                // ✅ 날짜 스타일 커스텀
                day: ({ date, selected }) => {
                  const isStart =
                    range.from && date.getTime?.() === range.from.getTime();
                  const isEnd =
                    range.to && date.getTime?.() === range.to.getTime();
                  const inRange =
                    range.from && range.to && date > range.from && date < range.to;

                  // ✅ 기본 날짜 스타일 (검정 글씨, 흰 배경)
                  let baseStyle =
                    "h-10 w-10 flex items-center justify-center text-sm font-normal text-gray-900 bg-white";

                  // ✅ 중간 구간 (연한 파란색 음영)
                  if (inRange)
                    baseStyle += " bg-blue-100 text-gray-900 rounded-none";

                  // ✅ 시작일 / 종료일 (파란색 동그라미)
                  if (isStart || isEnd)
                    baseStyle +=
                      " bg-[#0A3D91] text-white font-semibold rounded-full";

                  // ✅ 단일 선택 (range가 아닌 single 모드일 때 클릭된 날짜)
                  if (!range.from && selected)
                    baseStyle +=
                      " bg-[#0A3D91] text-white font-semibold rounded-full";

                  return baseStyle;
                },
              }}
            />
          </div>
        </Card>

        {range.from && (
          <div className="mt-8 text-center">
            <Button
              onClick={handleNext}
              className="mt-4 bg-[#0A3D91] hover:bg-[#0A3D91]/90 text-white text-lg px-8 py-5 rounded-lg"
            >
              날짜 설정 완료
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PlanStep1;
