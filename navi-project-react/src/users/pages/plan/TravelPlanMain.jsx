import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { getMyPlans } from "../../../common/api/planApi";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Card, Button, Modal, Spin } from "antd";

export default function TravelPlanMain() {
  const [plans, setPlans] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getMyPlans();
        setPlans(data || []);
      } catch (err) {
        console.error("🚨 여행 계획 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  /** ✅ 로그인 여부 확인 */
  const isLoggedIn = () => {
    const token =
      localStorage.getItem("ACCESS_TOKEN") ||
      localStorage.getItem("accessToken");
    return !!token;
  };

  /** ✅ 여행 계획 만들기 버튼 클릭 */
  const handleCreatePlan = () => {
    if (!isLoggedIn()) {
      Modal.info({
        title: "로그인 후 이용 가능합니다.",
        content: <p>여행 계획을 추가하려면 로그인이 필요합니다.</p>,
        okText: "확인",
        centered: true,
      });
      return;
    }
    navigate("/plans/planner");
  };

  /** ✅ 여행 상세보기 */
  const handleDetail = (plan) => {
    navigate(`/plans/${plan.id}`);
  };

  const today = new Date();
  const upcomingPlans = plans.filter(
    (p) => new Date(p.endDate) >= today || !p.endDate
  );
  const completedPlans = plans.filter((p) => new Date(p.endDate) < today);
  const currentList = activeTab === "upcoming" ? upcomingPlans : completedPlans;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "yy.MM.dd");
    } catch {
      return dateStr;
    }
  };

  return (
    <MainLayout>
      {/* ✅ 상단 배너 */}
      <div className="relative -mx-[calc((100vw-100%)/2)] w-screen h-[320px] overflow-hidden mb-12">
        <img
          src="src/users/images/planbanner.jpg"
          alt="여행 배너"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center z-10">
          <h2 className="text-3xl font-semibold text-[#1D4E89] drop-shadow-sm planTitle-text">
            나를 위한 여행 준비
          </h2>
          <p className="text-gray-700 mt-2 text-sm planSubTitle-text">
            설렘 가득한 순간이 기다리고 있어요
          </p>
        </div>
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
        <div className="absolute bottom-8 right-16 z-10">
          <Button
            type="default"
            size="large"
            className="plan-btn"
            onClick={handleCreatePlan}
          >
            여행 계획하기 <i className="bi bi-plus-circle ml-1"></i>
          </Button>
        </div>
      </div>

      {/* ✅ 여행 계획 리스트 */}
      <div className="flex flex-col items-center pb-10">
        {/* 탭 메뉴 */}
        <div className="w-full max-w-[900px] flex justify-center mb-8">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-2 text-sm font-semibold border-b-2 transition ${activeTab === "upcoming"
              ? "border-[#3A6EA5] text-[#3A6EA5]"
              : "border-transparent text-gray-400 hover:text-[#3A6EA5]"
              }`}
          >
            여행 예정 계획
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-2 text-sm font-semibold border-b-2 transition ${activeTab === "completed"
              ? "border-[#3A6EA5] text-[#3A6EA5]"
              : "border-transparent text-gray-400 hover:text-[#3A6EA5]"
              }`}
          >
            여행 완료 계획
          </button>
        </div>

        <Card className="w-[900px]">
          {loading ? (
            <div className="text-center py-10">
              <Spin tip="여행 데이터를 불러오는 중입니다..." />
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {activeTab === "upcoming"
                ? "예정된 여행이 없습니다."
                : "완료된 여행이 없습니다."}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {currentList.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handleDetail(plan)}
                  className="flex justify-between items-center border border-gray-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer bg-white"
                >
                  {/* 썸네일 */}
                  <img
                    src={plan.thumbnailPath || "https://placehold.co/100x100"}
                    alt="썸네일"
                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                  />

                  {/* 내용 */}
                  <div className="flex-1 ml-6">
                    <h3 className="text-lg font-semibold text-[#0A3D91]">
                      {plan.title || "제목 없음"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(plan.startDate)} ~ {formatDate(plan.endDate)}
                    </p>
                    <p className="text-gray-500 mt-1 text-sm line-clamp-1">
                      {plan.days?.map((d) => d.planTitle).slice(0, 3).join(", ") ||
                        "등록된 세부 일정이 없습니다."}
                    </p>
                  </div>

                  <div className="text-gray-400 hover:text-[#0A3D91]">
                    <i className="bi bi-chevron-right text-xl"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
