import React from "react";

export default function TitleDateDisplay({ title, dateRange }) {
  return (
    <div className="p-4 border-b border-gray-200 flex flex-col gap-1">
      <h2 className="font-semibold text-[#2F3E46] text-lg">
        ✈️ {title || "여행 제목 미정"}
      </h2>
      {dateRange?.length > 0 && (
        <span className="text-sm text-gray-500 ml-6">
          {dateRange[0].format("YYYY.MM.DD")} ~ {dateRange[1].format("YYYY.MM.DD")}
        </span>
      )}
    </div>
  );
}
