import React from "react";
import { Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";

export default function StepDrawer({
  step,
  setStep,
  title,
  selectedTravels,
  dateRange,
  stayPlans,
  stays,
  savePlan,
}) {
  const navigate = useNavigate();

  const steps = ["날짜 선택", "여행 제목", "시간 설정", "여행지 선택", "숙소 선택"];

  const handleComplete = async () => {
    if (!title?.trim()) {
      Modal.warning({
        title: "여행 제목을 입력하세요",
        content: "여행 제목을 입력해야 여행 계획을 완료할 수 있습니다.",
        centered: true,
      });
      setStep(2);
      return;
    }

    if (selectedTravels.length === 0) {
      Modal.warning({
        title: "여행지를 선택하세요",
        content: "최소 1개 이상의 여행지를 선택해야 합니다.",
        centered: true,
      });
      setStep(4);
      return;
    }

    try {
      const planData = {
        title,
        startDate: dateRange?.[0]?.format("YYYY-MM-DD"),
        endDate: dateRange?.[1]?.format("YYYY-MM-DD"),
        travels: selectedTravels.map((t) => t.id),
        stays: Object.entries(stayPlans).map(([stayName, dates]) => {
          const stayInfo = stays.find((s) => s.name === stayName);
          return { stayId: stayInfo?.id, dates };
        }),
      };

      await savePlan(planData);
      Modal.success({
        title: "🎉 여행 계획이 저장되었습니다!",
        content: "여행계획 페이지로 이동합니다.",
        centered: true,
        onOk: () => navigate("/plans"),
      });
    } catch (err) {
      Modal.error({
        title: "저장 실패",
        content: "여행계획 저장 중 오류가 발생했습니다.",
        centered: true,
      });
    }
  };

  return (
    <div className="flex flex-col justify-between bg-white p-5 h-full border-r border-gray-200">
      <div>
        <h3 className="text-[#2F3E46] font-bold mb-4">진행 단계</h3>
        <ul className="space-y-2">
          {steps.map((label, i) => (
            <li
              key={i}
              onClick={() => setStep(i + 1)}
              className={`cursor-pointer px-3 py-2 rounded-md transition ${
                step === i + 1
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
        {step > 1 && <Button className="w-full" onClick={() => setStep(step - 1)}>이전</Button>}
        {step < 5 && (
          <Button
            type="primary"
            className="w-full"
            style={{ background: "#2F3E46", border: "none" }}
            onClick={() => setStep(step + 1)}
          >
            다음
          </Button>
        )}
        {step === 5 && (
          <Button
            type="primary"
            className="w-full"
            style={{ background: "#2F3E46", border: "none" }}
            onClick={handleComplete}
          >
            완료
          </Button>
        )}
      </div>
    </div>
  );
}
