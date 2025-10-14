import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import CustomCard from "@/common/components/CustomCard";
import CustomButton from "@/common/components/CustomButton";
import { useNavigate } from "react-router-dom";
import { getMyPlans, deletePlan, sharePlan } from "@/common/api/planApi"; // ✅ 기존 API 유지
import { format } from "date-fns";

export default function MyPlanPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 내 여행 불러오기
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getMyPlans();
        setPlans(data || []);
      } catch (err) {
        console.error("내 여행 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "yyyy.MM.dd");
    } catch {
      return dateStr;
    }
  };

  // ✅ 여행 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말로 이 여행을 삭제하시겠습니까?")) return;
    try {
      await deletePlan(id);
      setPlans(plans.filter((p) => p.id !== id));
      alert("여행이 삭제되었습니다.");
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  // ✅ 여행 공유
  const handleShare = async (id) => {
    try {
      const shareLink = await sharePlan(id);
      await navigator.clipboard.writeText(shareLink);
      alert("공유 링크가 복사되었습니다!\n" + shareLink);
    } catch (err) {
      console.error("공유 실패:", err);
    }
  };

  // ✅ 여행 상세보기
  const handleDetail = (plan) => {
    navigate(`/plans/shared/${plan.id}`, { state: plan });
  };

  // ✅ 새 여행 만들기
  const handleCreatePlan = () => {
    navigate("/plans/step1");
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center py-10">
        {/* 타이틀 */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#0A3D91]">
            내 여행 일정 관리
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            저장된 여행 일정을 관리하고 공유할 수 있습니다.
          </p>
        </div>

        {/* 목록 영역 */}
        <CustomCard className="w-[900px]">
          {loading ? (
            <p className="text-gray-500 text-center py-8">
              여행 정보를 불러오는 중입니다...
            </p>
          ) : plans.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">등록된 여행이 없습니다.</p>
              <CustomButton onClick={handleCreatePlan}>
                새로운 여행 만들기
              </CustomButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => handleDetail(plan)}
                  >
                    <h2 className="text-lg font-semibold text-[#0A3D91]">
                      {plan.travelName}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(plan.startDate)} ~ {formatDate(plan.endDate)}
                    </p>
                    <p className="text-gray-500 mt-2 text-sm line-clamp-2">
                      {plan.planItems?.slice(0, 2).join(", ") ||
                        "세부 일정이 없습니다."}
                    </p>
                  </div>

                  {/* 하단 버튼 */}
                  <div className="mt-3 flex justify-between items-center">
                    <CustomButton
                      onClick={() => handleShare(plan.id)}
                      className="bg-[#0A3D91]/80 text-white text-sm px-3 py-2 rounded-md"
                    >
                      공유
                    </CustomButton>
                    <CustomButton
                      onClick={() => handleDelete(plan.id)}
                      className="bg-red-500 hover:bg-red-600 text-sm px-3 py-2 rounded-md"
                    >
                      삭제
                    </CustomButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CustomCard>

        {/* 새 여행 만들기 버튼 */}
        {plans.length > 0 && (
          <div className="mt-8">
            <CustomButton onClick={handleCreatePlan}>
              새 여행 계획 만들기
            </CustomButton>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
