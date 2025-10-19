import React, { useEffect } from "react";
import { List, TimePicker, Empty } from "antd";
import dayjs from "dayjs";
import TitleDateDisplay from "./TitleDateDisplay";

export default function TimeDrawer({ days, times, setTimes, title, dateRange }) {
  /** ✅ 기본 시간 자동 설정 (10:00 ~ 22:00) */
  useEffect(() => {
    if (!days?.length) return;
    setTimes((prev) => {
      const updated = { ...prev };
      days.forEach((d) => {
        const key = d.format("YYYY-MM-DD");
        if (!updated[key]) {
          updated[key] = { start: "10:00", end: "22:00" };
        }
      });
      return updated;
    });
  }, [days, setTimes]);

  /** ✅ 시간 변경 핸들러 */
  const handleChange = (date, field, value) => {
    setTimes((prev) => {
      const updated = { ...(prev[date.format("YYYY-MM-DD")] || {}) };
      updated[field] = value ? value.format("HH:mm") : null;
      return { ...prev, [date.format("YYYY-MM-DD")]: updated };
    });
  };

  /** ✅ 종료 시각 제한 (시작 시각 이후만 선택 가능) */
  const getDisabledEndTime = (date) => {
    const start = times[date.format("YYYY-MM-DD")]?.start;
    if (!start) return {};
    const startHour = dayjs(start, "HH:mm").hour();
    const startMinute = dayjs(start, "HH:mm").minute();

    return {
      disabledHours: () => Array.from({ length: startHour }, (_, i) => i),
      disabledMinutes: (selectedHour) =>
        selectedHour === startHour
          ? Array.from({ length: startMinute }, (_, i) => i)
          : [],
    };
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-md w-full">
      {/* ✅ 제목 + 날짜 표시 */}
      <TitleDateDisplay title={title} dateRange={dateRange} />

      {/* ✅ 안내 문구 */}
      <div className="px-5 mt-4 mb-5 text-sm text-gray-700 leading-relaxed">
        <p className="font-semibold text-[#2F3E46] mb-1">⏰ 여행시간 상세 설정</p>
        <p className="text-gray-500">
          먼저 여행의 시작시간과 종료시간을 설정해주세요. <br />
          기본 여행 시간은 <b>오전 10시 ~ 오후 10시 (총 12시간)</b>입니다.
        </p>
      </div>

      {/* ✅ 리스트 */}
      <div className="flex-1 overflow-y-auto custom-scroll px-5 pb-6">
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
                  className="hover:bg-[#F9FAFB] rounded-md px-2 py-1 transition"
                >
                  <div className="flex gap-3 items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {/* 날짜 */}
                      <div className="w-20 font-medium text-[#2F3E46]">
                        {d.format("MM/DD (ddd)")}
                      </div>

                      {/* 시작 시각 */}
                      <TimePicker
                        format="HH:mm"
                        minuteStep={5}
                        value={
                          dayTimes.start
                            ? dayjs(dayTimes.start, "HH:mm")
                            : dayjs("10:00", "HH:mm")
                        }
                        onChange={(v) => handleChange(d, "start", v)}
                      />

                      <span>~</span>

                      {/* 종료 시각 */}
                      <TimePicker
                        format="HH:mm"
                        minuteStep={5}
                        value={
                          dayTimes.end
                            ? dayjs(dayTimes.end, "HH:mm")
                            : dayjs("22:00", "HH:mm")
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
