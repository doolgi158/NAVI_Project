import React, { useEffect, useState } from "react";
import { List, TimePicker, Empty } from "antd";
import dayjs from "dayjs";
import { ClockCircleOutlined } from "@ant-design/icons";
import TitleDateDisplay from "./TitleDateDisplay";

export default function TimeDrawer({ days, times, setTimes, title, dateRange }) {
  const [openKey, setOpenKey] = useState(null);

  /** ✅ 기본 시간 자동 설정 */
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

  /** ✅ 종료시간 제한 */
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

  /** ✅ TimePicker 공통 렌더러 (경고 제거 버전) */
  const renderTimePicker = (d, type, defaultValue) => {
    const dayKey = d.format("YYYY-MM-DD");
    const dayTimes = times[dayKey] || {};

    return (
      <TimePicker
        format="HH:mm"
        minuteStep={5}
        value={
          dayTimes[type]
            ? dayjs(dayTimes[type], "HH:mm")
            : dayjs(defaultValue, "HH:mm")
        }
        showNow={false}
        needConfirm={false}
        open={openKey === `${dayKey}-${type}`}
        onOpenChange={(open) => setOpenKey(open ? `${dayKey}-${type}` : null)}
        onChange={(v) => handleChange(d, type, v)} // ✅ onSelect → onChange로 통일
        disabledTime={type === "end" ? () => getDisabledEndTime(d) : undefined}
        className="!w-[85px]"
      />
    );
  };

  return (
    <div
      className="flex flex-col flex-1 bg-[#FDFCF9] overflow-auto custom-scroll"
      style={{
        minWidth: "340px",
        padding: "24px 28px 36px",
        height: "100%",
      }}
    >
      {/* ✅ 제목 + 날짜 표시 */}
      <TitleDateDisplay title={title} dateRange={dateRange} />

      {/* ✅ 안내 문구 */}
      <div className="mt-5 mb-4 text-sm text-gray-700 leading-relaxed">
        <p className="font-semibold text-[#2F3E46] mb-1 flex items-center">
          <ClockCircleOutlined className="mr-1 text-[#2F3E46]" />
          여행시간 설정
        </p>
        <p className="text-gray-500">
          각 날짜별로 여행 시작시간과 종료시간을 설정해주세요.
          <br />
          기본값은 <b>10:00 ~ 22:00</b>입니다.
        </p>
      </div>

      {/* ✅ 리스트 */}
      <div className="pb-10">
        {days.length === 0 ? (
          <Empty description="여행 날짜를 먼저 선택해주세요" />
        ) : (
          <List
            dataSource={days}
            renderItem={(d) => (
              <List.Item
                key={d.format("YYYY-MM-DD")}
                className="rounded shadow-sm px-5 py-3 mb-3 hover:bg-[#ffbf231f] transition "
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-24 font-medium text-[#2F3E46]">
                    {d.format("MM/DD (ddd)")}
                  </div>

                  <div className="flex items-center gap-2">
                    {renderTimePicker(d, "start", "10:00")}
                    <span className="text-gray-600 px-1">~</span>
                    {renderTimePicker(d, "end", "22:00")}
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
