import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { LeftOutlined } from "@ant-design/icons";

export default function StepDrawer({ step, setStep, onSaveSchedule }) {
  const navigate = useNavigate();
  const steps = ["날짜 선택", "여행 제목", "시간 설정", "여행지 선택", "숙소 선택"];

  return (
    <div className="flex flex-col justify-between bg-white p-5 h-full border-r border-gray-200">
      {/* ✅ 상단 헤더 영역 */}
      <div>
        {/* 🔙 목록으로 버튼을 위로 이동 */}
        <div className="flex justify-start mb-4">
          <Button
            icon={<LeftOutlined />}
            onClick={() => navigate("/plans")}
            className="!rounded-full !border-none !px-3 !py-1.5 
                       !text-[12px] !font-semibold 
                       !text-[#172554] !bg-[#e7e5e4]
                       hover:!bg-[#D0E0FF] hover:!text-[#06306E]
                       shadow-sm transition-all duration-200"
          >
            목록으로
          </Button>
        </div>

        {/* ✅ 진행 단계 제목 */}
        <h3 className="text-[#2F3E46] font-bold text-lg mb-4 text-left">
          진행 단계
        </h3>

        {/* ✅ 단계 목록 */}
        <ul className="space-y-2 ">
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

      {/* ✅ 하단 버튼 영역 */}
      <div className="space-y-2 mt-6">
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
