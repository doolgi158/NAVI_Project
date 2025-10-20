import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { getMyPlans, deletePlan } from "../../../common/api/planApi";
import { useNavigate } from "react-router-dom";
import { Button, Modal, message } from "antd";
import PlanList from "../plan/components/PlanList";
import { PlusOutlined } from "@ant-design/icons";
import { startOfDay, isAfter, isBefore, isSameDay } from "date-fns";

export default function TravelPlanMain() {
  const [plans, setPlans] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState({ upcoming: 1, completed: 1 });
  const pageSize = 5;
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

  const handleDelete = (id) =>
    Modal.confirm({
      title: "여행 삭제",
      content: "정말로 이 여행을 삭제하시겠습니까?",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        try {
          await deletePlan(id);
          setPlans((prev) => prev.filter((p) => p.id !== id));
          message.success("여행이 삭제되었습니다.");
        } catch {
          Modal.error({ title: "삭제 실패", content: "삭제 중 오류가 발생했습니다." });
        }
      },
    });

  const handleDetail = (plan) => navigate(`/plans/${plan.id}`);
  const handleEdit = (plan) => navigate(`/plans/planner?planId=${plan.id}`);
  const handleCreatePlan = () => navigate("/plans/planner");
  const handlePageChange = (newPage) =>
    setPage((prev) => ({ ...prev, [activeTab]: newPage }));

  /** ✅ 날짜별 분류 + 정렬 */
  const today = startOfDay(new Date());

  // ✅ 예정된 여행: D-Day 가까운 순으로 정렬
  const upcomingPlans = plans
    .filter((p) => {
      const end = startOfDay(new Date(p.endDate));
      return isAfter(end, today) || isSameDay(end, today);
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  // ✅ 완료된 여행: 최근 완료 순으로 정렬
  const completedPlans = plans
    .filter((p) => {
      const end = startOfDay(new Date(p.endDate));
      return isBefore(end, today);
    })
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

  // ✅ 현재 탭 리스트 결정 (이 줄이 반드시 있어야 함)
  const currentList = activeTab === "upcoming" ? upcomingPlans : completedPlans;


  return (
    <MainLayout>
      {/* 상단 배너 */}
      <div className="relative -mx-[calc((100vw-100%)/2)] w-screen h-[300px] overflow-hidden mb-12">
        <img
          src="src/users/images/planbanner.jpg"
          alt="여행 배너"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
        <div className="absolute inset-0 flex flex-col justify-center items-center z-10">
          <h2 className="text-3xl font-semibold text-[#1D4E89] mb-2 drop-shadow-sm">
            나를 위한 여행 준비
          </h2>
          <p className="text-gray-700 text-sm">설렘 가득한 순간이 기다리고 있어요 ✈️</p>
        </div>
        <div className="absolute bottom-10 right-16 z-20">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-[#3A6EA5] hover:bg-[#2F5C8F]"
            onClick={handleCreatePlan}
          >
            여행 계획하기
          </Button>
        </div>
      </div>

      {/* 여행 계획 리스트 */}
      <div className="flex flex-col items-center pb-12">
        <div className="w-full max-w-[900px] flex justify-center mb-8">
          {[
            { key: "upcoming", label: "여행 예정 계획" },
            { key: "completed", label: "여행 완료 계획" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 text-sm font-semibold border-b-2 transition ${activeTab === tab.key
                ? "border-[#3A6EA5] text-[#3A6EA5]"
                : "border-transparent text-gray-400 hover:text-[#3A6EA5]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <PlanList
          plans={currentList}
          loading={loading}
          showPagination
          currentPage={page[activeTab]}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onDetail={handleDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </MainLayout>
  );
}
