import React, { useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import CustomCard from "@/common/components/CustomCard";
import CustomButton from "@/common/components/CustomButton";
import { useNavigate, useLocation } from "react-router-dom";
import { getList } from "@/common/api/naviApi"; 

export default function PlanStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const { startDate, endDate } = location.state || {};

  const [travels, setTravels] = useState([]);
  const [selectedTravel, setSelectedTravel] = useState(null);
  const [loading, setLoading] = useState(true);


  // ✅ 여행지 목록 불러오기
  useEffect(() => {
    const fetchTravels = async () => {
      try {
        const response = await getList();
        setTravels(response || []);
      } catch (err) {
        console.error("여행지 목록 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTravels();
  }, []);

  // ✅ 여행지 선택
  const handleSelectTravel = (travel) => {
    setSelectedTravel(travel);
  };

  // ✅ 다음 단계로 이동
  const handleNext = () => {
    if (!selectedTravel) {
      alert("여행지를 선택해주세요!");
      return;
    }
    navigate("/plans/step3", {
      state: {
        startDate,
        endDate,
        travelId: selectedTravel.id,
        travelName: selectedTravel.name,
      },
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center py-10">
        {/* 상단 헤더 */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#0A3D91]">여행지 선택</h1>
          <p className="text-gray-600 mt-2 text-sm">
            여행할 지역을 선택해주세요
          </p>
        </div>

        {/* 여행지 카드 리스트 */}
        <CustomCard className="w-[800px] text-center">
          {loading ? (
            <p className="text-gray-500">여행지 목록을 불러오는 중...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {travels.length > 0 ? (
                travels.map((travel) => (
                  <div
                    key={travel.id}
                    onClick={() => handleSelectTravel(travel)}
                    className={`cursor-pointer border rounded-lg p-4 text-center transition ${
                      selectedTravel?.id === travel.id
                        ? "border-[#0A3D91] bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <h3 className="font-semibold text-lg text-gray-800">
                      {travel.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {travel.description || "설명 없음"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">등록된 여행지가 없습니다.</p>
              )}
            </div>
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
