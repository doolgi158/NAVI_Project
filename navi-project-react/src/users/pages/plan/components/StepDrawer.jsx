import React from "react";
import { Button } from "antd";

export default function StepDrawer({ step, setStep, onSaveSchedule }) {
  const steps = ["날짜 선택", "여행 제목", "시간 설정", "여행지 선택", "숙소 선택"];

  return (
    <div className="flex flex-col justify-between bg-white p-5 h-full border-r border-gray-200">
      <div>
        <h3 className="text-[#2F3E46] font-bold mb-4">진행 단계</h3>
        <ul className="space-y-2">
          {steps.map((label, i) => (
            <li
              key={i}
              onClick={() => setStep(i + 1)}
              className={`cursor-pointer px-3 py-2 rounded-md transition ${step === i + 1
                ? "bg-[#FFF5B7] text-[#2F3E46] font-semibold text-sm"
                : "hover:bg-[#FAF9F6] text-gray-700"
                }`}
            >
              Step {i + 1}
              <br />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        {step > 1 && (
          <Button className="w-full" onClick={() => setStep(step - 1)}>
            이전
          </Button>
        )}

        {step === 5 ? (
          <Button
            type="primary"
            className="w-full"
            style={{ background: "#2F3E46", border: "none" }}
            onClick={onSaveSchedule}
          >
            저장
          </Button>
        ) : (
          step < 5 && (
            <Button
              type="primary"
              className="w-full"
              style={{ background: "#2F3E46", border: "none" }}
              onClick={() => setStep(step + 1)}
            >
              다음
            </Button>
          )
        )}
      </div>
    </div>
  );
}
