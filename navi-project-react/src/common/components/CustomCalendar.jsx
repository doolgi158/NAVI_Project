import React, { useState } from "react";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isWithinInterval,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import "bootstrap-icons/font/bootstrap-icons.css";

const NAVI_BLUE = "#0A3D91";
const NAVI_YELLOW = "#FFCC00";

export default function CustomCalendar({ onSelectRange }) {
  const [range, setRange] = useState({ from: null, to: null });
  const [baseDate, setBaseDate] = useState(new Date());

  const handleDayClick = (day) => {
    // ✅ 과거 날짜 선택 방지
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(day);
    target.setHours(0, 0, 0, 0);
    if (target.getTime() < today.getTime()) return;

    if (!range.from && !range.to) {
      setRange({ from: day, to: null });
      if (onSelectRange) onSelectRange({ from: day, to: null });
      return;
    }

    if (range.from && !range.to) {
      if (isSameDay(day, range.from)) {
        setRange({ from: day, to: day });
        if (onSelectRange) onSelectRange({ from: day, to: day });
      } else if (day < range.from) {
        setRange({ from: day, to: range.from });
        if (onSelectRange) onSelectRange({ from: day, to: range.from });
      } else {
        const newRange = { from: range.from, to: day };
        setRange(newRange);
        if (onSelectRange) onSelectRange(newRange);
      }
      return;
    }

    if (range.from && range.to) {
      setRange({ from: day, to: null });
      if (onSelectRange) onSelectRange({ from: day, to: null });
    }
  };

  const renderMonth = (monthDate) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start, end });
    const offset = getDay(start);

    // ✅ 오늘 기준값 (0시 고정)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="p-4">
        <div className="text-center text-lg font-semibold text-[#0A3D91] mb-2">
          {format(monthDate, "M월", { locale: ko })}
        </div>

        {/* 요일 */}
        <div className="grid grid-cols-7 gap-1 text-center text-gray-500 mb-1 text-sm">
          {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
            <div
              key={d}
              className={i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : ""}
            >
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 */}
        <div className="grid grid-cols-7 gap-1 relative">
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map((day, idx) => {
            const dayCompare = new Date(day);
            dayCompare.setHours(0, 0, 0, 0);
            const isPast = dayCompare.getTime() < today.getTime(); // ✅ 정확한 비교

            const isStart = range.from && isSameDay(day, range.from);
            const isEnd = range.to && isSameDay(day, range.to);
            const inRange =
              range.from &&
              range.to &&
              isWithinInterval(day, { start: range.from, end: range.to });

            // 기본 스타일
            let className =
              "relative h-10 w-10 flex items-center justify-center text-sm font-medium transition-all";

            // ✅ 과거 날짜 스타일
            if (isPast)
              className +=
                " text-gray-400 bg-gray-100 cursor-not-allowed opacity-60 hover:bg-gray-100";

            const isWeekend = [0, 6].includes(getDay(day));
            if (!isPast && isWeekend) className += " text-blue-500";
            if (!isPast && getDay(day) === 0) className += " text-red-500";

            // ✅ 구간 배경 (연파랑)
            const background =
              inRange && !isStart && !isEnd
                ? "before:content-[''] before:absolute before:inset-y-0 before:-left-[1px] before:-right-[1px] before:bg-blue-100 before:rounded-none before:-z-10"
                : "";

            // ✅ 각 날짜 배경
            let bg = "";
            if (isPast) {
              bg = "bg-gray-100"; // 과거일은 회색배경
            } else if (isStart || isEnd) {
              bg = `bg-[${NAVI_BLUE}] text-white font-semibold rounded-full z-20`;
            } else if (isToday(day)) {
              bg = `border  border-gray-300 text-black font-semibold rounded-full`;
            } else {
              bg += " bg-white hover:bg-blue-50";
            }

            // ✅ 둥근 모서리 설정
            const radius =
              isStart && range.to
                ? "rounded-l-full"
                : isEnd && range.from
                ? "rounded-r-full"
                : inRange
                ? "rounded-none"
                : "rounded-full";

            return (
              <button
                key={idx}
                onClick={() => !isPast && handleDayClick(day)} // 과거일 클릭 방지
                disabled={isPast}
                className={`${className} ${bg} ${radius} ${background} z-10`}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const nextMonth = addMonths(baseDate, 1);

  return (
    <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-4">
      {/* 상단 네비게이션 */}
      <div className="flex justify-between items-center w-full mb-2">
        <button
          onClick={() => setBaseDate(addMonths(baseDate, -1))}
          className="text-[#0A3D91] hover:bg-blue-50 rounded-full p-2"
        >
          <i className="bi bi-caret-left-fill text-xl"></i>
        </button>
        <div className="text-lg font-semibold text-[#0A3D91]">
          {format(baseDate, "yyyy년", { locale: ko })}
        </div>
        <button
          onClick={() => setBaseDate(addMonths(baseDate, 1))}
          className="text-[#0A3D91] hover:bg-blue-50 rounded-full p-2"
        >
          <i className="bi bi-caret-right-fill text-xl"></i>
        </button>
      </div>

      {/* 반응형: 모바일은 1달, PC는 2달 */}
      <div className="flex flex-col md:flex-row justify-center gap-8">
        {renderMonth(baseDate)}
        <div className="hidden md:block">{renderMonth(nextMonth)}</div>
      </div>
    </div>
  );
}
