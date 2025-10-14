import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import dayjs from "dayjs";
import api from "../../../common/api/naviApi";
import { useNavigate } from "react-router-dom";
import { format, isWithinInterval } from "date-fns";

const NAVI_BLUE = "#0A3D91";

const TravelPlanMain = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showCalendar, setShowCalendar] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterRange, setFilterRange] = useState(null);

  /** ✅ 여행계획 불러오기 */
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get("/travelplan/my");
        setPlans(res.data || []);
      } catch (err) {
        toast.error("여행계획 조회 실패");
      }
    };
    fetchPlans();
  }, []);

  /** ✅ 여행 분류 */
  const today = dayjs();
  const upcomingPlans = plans.filter((p) => dayjs(p.endDate).isSameOrAfter(today, "day"));
  const completedPlans = plans.filter((p) => dayjs(p.endDate).isBefore(today, "day"));
  const tabPlans = activeTab === "upcoming" ? upcomingPlans : completedPlans;

  /** ✅ 필터링 */
  const filteredPlans = filterRange
    ? tabPlans.filter((p) =>
        isWithinInterval(new Date(p.startDate), {
          start: filterRange.start,
          end: filterRange.end,
        })
      )
    : tabPlans;

  /** ✅ 공유 링크 복사 */
  const handleShare = async (planId) => {
    const shareUrl = `${window.location.origin}/plan/share/${planId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("공유 링크가 복사되었습니다!");
    } catch {
      toast.error("복사 실패. 수동으로 복사해주세요.");
    }
  };

  /** ✅ 삭제 다이얼로그 */
  const handleDelete = (plan) => setDeleteTarget(plan);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/travelplan/delete/${deleteTarget.id}`);
      setPlans(plans.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("삭제 완료!");
    } catch {
      toast.error("삭제 실패");
    }
  };

  /** ✅ 달력 셀 표시 */
  const dateCellRender = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const match = plans.filter(
      (p) =>
        dayjs(dateStr).isBetween(p.startDate, p.endDate, "day", "[]")
    );
    if (match.length === 0) return null;
    return (
      <div className="flex flex-col gap-1">
        {match.map((p) => (
          <Badge key={p.id} variant="secondary" className="text-[10px]">
            {p.title || "여행"}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      {/* 상단 배너 */}
      <div
        className="w-full h-[250px] bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/travel_banner.jpg')`,
          borderBottom: `3px solid ${NAVI_BLUE}`,
        }}
      />

      <div className="max-w-6xl mx-auto py-10 px-4 space-y-6">
        {/* 상단 컨트롤 */}
        <div className="flex justify-between items-center">
          <Button
            className="bg-[#0A3D91] hover:bg-[#0A3D91]/90 text-white"
            onClick={() => navigate("/plans/step1")}
          >
            ✈️ 여행 계획하기
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              {showCalendar ? "리스트 보기" : "달력 보기"}
            </Button>
          </div>
        </div>

        {/* 탭 */}
        <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full bg-blue-50 rounded-lg">
            <TabsTrigger value="upcoming">여행 예정 계획</TabsTrigger>
            <TabsTrigger value="completed">여행 완료 계획</TabsTrigger>
          </TabsList>

          {/* 리스트 보기 */}
          <TabsContent value={activeTab}>
            {showCalendar ? (
              <div className="mt-6 bg-white border rounded-lg p-4">
                <Calendar
                  mode="single"
                  className="rounded-md"
                  components={{
                    DayContent: ({ date }) => (
                      <div className="relative">
                        <div className="text-xs text-gray-600 text-center">
                          {format(date, "d")}
                        </div>
                        <div className="absolute top-4 left-0 right-0 text-center">
                          {dateCellRender(date)}
                        </div>
                      </div>
                    ),
                  }}
                />
              </div>
            ) : filteredPlans.length === 0 ? (
              <p className="text-gray-500 mt-10 text-center">
                여행 계획이 없습니다.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                {filteredPlans.map((plan) => {
                  const isCompleted = dayjs(plan.endDate).isBefore(today, "day");
                  return (
                    <Card
                      key={plan.id}
                      className="p-4 border shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-semibold text-[#0A3D91]">
                          {plan.title || "나의 여행 계획"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {plan.startDate} ~ {plan.endDate}
                        </p>
                        <div className="flex justify-between items-center">
                          <Badge
                            variant={isCompleted ? "outline" : "default"}
                            className={isCompleted ? "text-gray-500" : "bg-blue-100 text-[#0A3D91]"}
                          >
                            {isCompleted ? "여행 완료" : "여행 예정"}
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate("/plans/step4", {
                                  state: { ...plan, isLocked: isCompleted },
                                })
                              }
                            >
                              보기
                            </Button>
                            {isCompleted ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate("/plans/step4", {
                                    state: { ...plan, isLocked: true },
                                  })
                                }
                              >
                                PDF
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate("/plans/step4", {
                                    state: { ...plan, isLocked: false },
                                  })
                                }
                              >
                                수정
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShare(plan.id)}
                            >
                              공유
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(plan)}
                            >
                              삭제
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* 삭제 다이얼로그 */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>여행계획 삭제</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            “{deleteTarget?.title || "이 여행"}” 계획을 삭제하시겠습니까?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default TravelPlanMain;
