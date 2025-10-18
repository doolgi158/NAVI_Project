import React from "react";
import { List, TimePicker, Empty } from "antd";
import dayjs from "dayjs";
import TitleDateDisplay from "./TitleDateDisplay";

export default function TimeDrawer({ days, times, setTimes, title, dateRange }) {
  const handleChange = (date, field, value) => {
    setTimes((prev) => {
      const updated = { ...(prev[date.format("YYYY-MM-DD")] || {}) };
      updated[field] = value ? value.format("HH:mm") : null;
      return { ...prev, [date.format("YYYY-MM-DD")]: updated };
    });
  };

  const getDisabledEndTime = (date) => {
    return {
      disabledHours: () => {
        // 예: 시작 시각 이후만 선택 가능하게
        const start = times[date.format("YYYY-MM-DD")]?.start;
        if (!start) return [];
        const startHour = dayjs(start, "HH:mm").hour();
        return Array.from({ length: startHour }, (_, i) => i);
      },
      disabledMinutes: () => [],
    };
  };


  return (
    <div className="flex flex-col h-full bg-white shadow-md w-full">
      <TitleDateDisplay title={title} dateRange={dateRange} />
      <h2 className="text-[#2F3E46] font-semibold text-lg mb-4 pl-4 mt-4">⏰ 일자별 시간 설정</h2>
      <div className="flex-1 overflow-y-auto custom-scroll pr-4 pl-4">
        {days.length === 0 ? (
          <Empty description="여행 날짜를 먼저 선택해주세요" />
        ) : (
          <List
            dataSource={days}
            renderItem={(d) => (
              <List.Item key={d.format("YYYY-MM-DD")} className="hover:bg-[#F7F8F7] rounded-md px-2 py-1">
                <div className="flex gap-3 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-20 font-medium text-[#2F3E46]">
                      {d.format("MM/DD (ddd)")}
                    </div>
                    <TimePicker
                      placeholder="시작"
                      format="HH:mm"
                      minuteStep={5}
                      value={times[d.format("YYYY-MM-DD")]?.start ? dayjs(times[d.format("YYYY-MM-DD")].start, "HH:mm") : null}
                      onChange={(v) => handleChange(d, "start", v)}
                    />
                    <span>~</span>
                    <TimePicker
                      placeholder="종료"
                      format="HH:mm"
                      minuteStep={5}
                      {...getDisabledEndTime(d)}
                      value={times[d.format("YYYY-MM-DD")]?.end ? dayjs(times[d.format("YYYY-MM-DD")].end, "HH:mm") : null}
                      onChange={(v) => handleChange(d, "end", v)}
                      disabledTime={() => getDisabledEndTime(d)}
                    />
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
}
