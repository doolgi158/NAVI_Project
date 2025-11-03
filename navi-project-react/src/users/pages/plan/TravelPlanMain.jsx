import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { getMyPlans, deletePlan } from "../../../common/api/planApi";
import { useNavigate } from "react-router-dom";
import { Button, Modal, message } from "antd";
import PlanList from "../plan/components/PlanList";
import { PlusOutlined } from "@ant-design/icons";
import { startOfDay, isAfter, isBefore, isSameDay } from "date-fns";
import { getCookie } from "@/common/util/cookie";

export default function TravelPlanMain() {
  const [plans, setPlans] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState({ upcoming: 1, completed: 1 });
  const pageSize = 5;
  const navigate = useNavigate();

  /** ✅ 여행계획 목록 불러오기 */
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await getMyPlans();

        // ✅ ApiResponse 구조 대비
        const planList = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : [];

        setPlans(planList);
      } catch (err) {
        console.error("❌ 여행계획 불러오기 실패:", err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  /** ✅ 삭제 기능 */
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

          // ✅ 1. 삭제된 후 목록 반영
          setPlans((prev) => {
            const updated = prev.filter((p) => p.planId !== id);

            // ✅ 2. 페이지 보정 로직 (현재 탭)
            const isCompletedTab = activeTab === "completed";

            // 삭제 후 남은 목록 계산
            const totalAfterDelete = isCompletedTab
              ? updated.filter((p) => {
                const end = startOfDay(new Date(p.endDate));
                return isBefore(end, today);
              }).length
              : updated.filter((p) => {
                const end = startOfDay(new Date(p.endDate));
                return isAfter(end, today) || isSameDay(end, today);
              }).length;

            // ✅ 3. 현재 페이지 기준
            const totalPages = Math.ceil(totalAfterDelete / pageSize);
            const currentPage = page[activeTab];

            // ✅ 4. 현재 페이지가 범위를 초과하면 이전 페이지로 이동
            if (currentPage > totalPages && currentPage > 1) {
              setPage((prev) => ({ ...prev, [activeTab]: currentPage - 1 }));
            }

            return updated;
          });

          message.success("여행이 삭제되었습니다.");
        } catch {
          Modal.error({
            title: "삭제 실패",
            content: "삭제 중 오류가 발생했습니다.",
          });
        }
      },
    });

  /** ✅ 상세보기 / 수정 / 새 계획 이동 */
  const handleDetail = (plan) =>
    navigate(`/plans/planner/detail?planId=${plan.planId}&mode=view`);
  const handleEdit = (plan) =>
    navigate(`/plans/planner/detail?planId=${plan.planId}&mode=edit`);
  const handleCreatePlan = () => {
    try {
      const cookie = getCookie("userCookie");
      if (!cookie) {
        Modal.warning({
          title: "로그인이 필요합니다",
          content: "여행 계획을 세우기 위해서는 로그인이 필요합니다.",
          okText: "확인",
          centered: true,
          onOk: () => navigate("/plans"),
        });
        return;
      }

      const user = typeof cookie === "string" ? JSON.parse(cookie) : cookie;
      if (!user?.userId) {
        Modal.warning({
          title: "로그인 정보가 유효하지 않습니다",
          content: "세션이 만료되었거나 로그인 정보가 손상되었습니다.\n다시 로그인해주세요.",
          okText: "확인",
          centered: true,
          onOk: () => navigate("/plans"),
        });
        return;
      }

      //✅ 로그인된 사용자만 플래너로 이동
      navigate("/plans/planner");
    } catch (err) {
      console.error("❌ 로그인 확인 오류:", err);
      Modal.error({
        title: "로그인 오류",
        content: "로그인 정보를 확인하는 중 문제가 발생했습니다.",
        okText: "확인",
        centered: true,
      });
    }
  };

  /** ✅ 탭, 페이지네이션 */
  const handlePageChange = (newPage) =>
    setPage((prev) => ({ ...prev, [activeTab]: newPage }));

  /** ✅ 일정 분류 */
  const today = startOfDay(new Date());

  const upcomingPlans = plans
    .filter((p) => {
      const end = startOfDay(new Date(p.endDate));
      return isAfter(end, today) || isSameDay(end, today);
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const completedPlans = plans
    .filter((p) => {
      const end = startOfDay(new Date(p.endDate));
      return isBefore(end, today);
    })
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

  const currentList = activeTab === "upcoming" ? upcomingPlans : completedPlans;

  /** ✅ 렌더링 */
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
          <p className="text-gray-700 text-sm">
            설렘 가득한 순간이 기다리고 있어요 ✈️
          </p>
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
