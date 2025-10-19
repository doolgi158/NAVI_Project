import React from "react";
import { List, TimePicker, Empty } from "antd";
import dayjs from "dayjs";
import TitleDateDisplay from "./TitleDateDisplay";

export default function TimeDrawer({ days, times, setTimes, title, dateRange }) {
  /** ✅ 시간 변경 핸들러 */
  const handleChange = (date, field, value) => {
    setTimes((prev) => {
      const updated = { ...(prev[date.format("YYYY-MM-DD")] || {}) };
      updated[field] = value ? value.format("HH:mm") : null;
      return { ...prev, [date.format("YYYY-MM-DD")]: updated };
    });
  };

  /** ✅ 종료 시각 비활성화 (시작 시각 이후만 선택 가능) */
  const getDisabledEndTime = (date) => {
    const start = times[date.format("YYYY-MM-DD")]?.start;
    if (!start) return {};

    const startHour = dayjs(start, "HH:mm").hour();
    const startMinute = dayjs(start, "HH:mm").minute();

    return {
      disabledHours: () =>
        Array.from({ length: startHour }, (_, i) => i), // 시작 시각 이전 시간 비활성화
      disabledMinutes: (selectedHour) =>
        selectedHour === startHour
          ? Array.from({ length: startMinute }, (_, i) => i)
          : [],
    };
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-md w-full">
      <TitleDateDisplay title={title} dateRange={dateRange} />
      <h2 className="text-[#2F3E46] font-semibold text-lg mb-4 pl-4 mt-4">
        ⏰ 일자별 시간 설정
      </h2>

      <div className="flex-1 overflow-y-auto custom-scroll pr-4 pl-4">
        {days.length === 0 ? (
          <Empty description="여행 날짜를 먼저 선택해주세요" />
        ) : (
          <List
            dataSource={days}
            renderItem={(d) => {
              const dayKey = d.format("YYYY-MM-DD");
              const dayTimes = times[dayKey] || {};

              return (
                <List.Item
                  key={dayKey}
                  className="hover:bg-[#F7F8F7] rounded-md px-2 py-1"
                >
                  <div className="flex gap-3 items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* 날짜 */}
                      <div className="w-20 font-medium text-[#2F3E46]">
                        {d.format("MM/DD (ddd)")}
                      </div>

                      {/* 시작 시각 */}
                      <TimePicker
                        placeholder="시작"
                        format="HH:mm"
                        minuteStep={5}
                        value={
                          dayTimes.start
                            ? dayjs(dayTimes.start, "HH:mm")
                            : null
                        }
                        onChange={(v) => handleChange(d, "start", v)}
                      />

                      <span>~</span>

                      {/* 종료 시각 */}
                      <TimePicker
                        placeholder="종료"
                        format="HH:mm"
                        minuteStep={5}
                        value={
                          dayTimes.end ? dayjs(dayTimes.end, "HH:mm") : null
                        }
                        onChange={(v) => handleChange(d, "end", v)}
                        disabledTime={() => getDisabledEndTime(d)}
                      />
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
