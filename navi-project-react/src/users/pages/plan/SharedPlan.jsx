import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { sharePlan } from "../../../common/api/planApi";

export default function SharedPlan() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 공유된 일정 불러오기
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await sharePlan(planId);
        setPlan(data);
      } catch (err) {
        console.error("공유된 일정 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "yyyy.MM.dd");
    } catch {
      return dateStr;
    }
  };

  // ✅ 일정 복사
  const handleCopyPlan = () => {
    alert("이 여행 일정을 내 여행으로 복사했습니다! ✈️");
    navigate("/plans/main");
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center py-10">
        {/* 상단 제목 */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#0A3D91]">
            공유된 여행 일정
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            친구가 공유한 여행 계획을 확인해보세요
          </p>
        </div>

        {/* 본문 카드 */}
        <CustomCard className="w-[800px] text-left">
          {loading ? (
            <p className="text-gray-500 text-center">일정 정보를 불러오는 중...</p>
          ) : plan ? (
            <>
              {/* 여행 정보 */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-[#0A3D91] mb-2">
                  🏖️ 여행지
                </h2>
                <p className="text-gray-700">
                  {plan.travelName || "여행지 정보 없음"}
                </p>
              </div>

              {/* 여행 날짜 */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-[#0A3D91] mb-2">
                  📅 여행 기간
                </h2>
                <p className="text-gray-700">
                  {formatDate(plan.startDate)} ~ {formatDate(plan.endDate)} (
                  {(() => {
                    const start = new Date(plan.startDate);
                    const end = new Date(plan.endDate);
                    const nights = Math.max(
                      0,
                      Math.floor((end - start) / (1000 * 60 * 60 * 24))
                    );
                    const days = nights + 1;
                    return `${nights}박 ${days}일`;
                  })()}
                  )
                </p>
              </div>

              {/* 일정 목록 */}
              <div>
                <h2 className="text-lg font-semibold text-[#0A3D91] mb-2">
                  🧭 세부 일정
                </h2>
                {plan.planItems && plan.planItems.length > 0 ? (
                  <ul className="space-y-2">
                    {plan.planItems.map((item, index) => (
                      <li
                        key={index}
                        className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg text-gray-800"
                      >
                        {index + 1}. {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">
                    등록된 세부 일정이 없습니다.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center">공유된 일정을 찾을 수 없습니다.</p>
          )}
        </CustomCard>

        {/* 버튼 영역 */}
        {!loading && plan && (
          <div className="mt-8 flex gap-4">
            <CustomButton onClick={() => navigate(-1)} className="bg-gray-400 hover:bg-gray-500">
              돌아가기
            </CustomButton>
            <CustomButton onClick={handleCopyPlan}>
              내 여행으로 복사
            </CustomButton>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
