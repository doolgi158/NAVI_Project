import React, { useState } from "react";
import MainLayout from "../../layout/MainLayout";
import CustomCard from "@/common/components/CustomCard";
import CustomButton from "@/common/components/CustomButton";
import { useNavigate, useLocation } from "react-router-dom";

export default function PlanStep3() {
  const navigate = useNavigate();
  const location = useLocation();
  const { startDate, endDate, travelId, travelName } = location.state || {};

  const [planItems, setPlanItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  // ✅ 일정 추가
  const handleAddItem = () => {
    if (!newItem.trim()) return;
    setPlanItems([...planItems, newItem]);
    setNewItem("");
  };

  // ✅ 일정 삭제
  const handleRemoveItem = (index) => {
    setPlanItems(planItems.filter((_, i) => i !== index));
  };

  // ✅ 다음 단계 이동
  const handleNext = () => {
    if (planItems.length === 0) {
      alert("일정을 최소 1개 이상 추가해주세요!");
      return;
    }

    navigate("/plans/step4", {
      state: {
        startDate,
        endDate,
        travelId,
        travelName,
        planItems,
      },
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center py-10">
        {/* 상단 타이틀 */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#0A3D91]">여행 일정 구성</h1>
          <p className="text-gray-600 mt-2 text-sm">
            여행 중 방문할 장소나 활동을 추가하세요
          </p>
        </div>

        {/* 일정 입력 / 리스트 */}
        <CustomCard className="w-[800px] text-center">
          {/* 입력창 */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <input
              type="text"
              placeholder="일정 추가하기 (예: 맛집 탐방)"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="w-2/3 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
            />
            <CustomButton onClick={handleAddItem}>추가</CustomButton>
          </div>

          {/* 일정 목록 */}
          {planItems.length > 0 ? (
            <ul className="space-y-3">
              {planItems.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg"
                >
                  <span className="text-gray-800 text-sm">{item}</span>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 text-sm font-semibold hover:underline"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">
              아직 추가된 일정이 없습니다.
            </p>
          )}
        </CustomCard>

        {/* 하단 버튼 */}
        <div className="mt-8">
          <CustomButton onClick={handleNext}>다음 단계</CustomButton>
        </div>
      </div>
    </MainLayout>
  );
}
