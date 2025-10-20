import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { getMyPlans, deletePlan } from "@/common/api/planApi";
import { Button, Modal, message } from "antd";
import PlanList from "../plan/components/PlanList";

export default function MyPlanPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getMyPlans();
        setPlans(data || []);
      } catch (err) {
        console.error("🚨 내 여행 불러오기 실패:", err);
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

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center py-10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#0A3D91]">내 여행 일정 관리</h1>
          <p className="text-gray-600 mt-2 text-sm">
            저장된 여행 일정을 관리하고 공유할 수 있습니다.
          </p>
        </div>

        <PlanList
          plans={plans}
          loading={loading}
          onDetail={handleDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {plans.length > 0 && (
          <div className="mt-8">
            <Button onClick={handleCreatePlan} type="primary">
              새 여행 계획 만들기
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
