import React, { useState, useEffect, useRef, useCallback } from "react";
import MainLayout from "../../layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../../images/navi_logo.png";

const NAVI_BLUE = "#0A3D91";

const PlanStep4 = () => {
  const { state } = useLocation();
  const { selectedPlaces = [], selectedHotels = [], startDate, endDate } = state || {};
  const [days, setDays] = useState([]);
  const [plan, setPlan] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const [timeDialog, setTimeDialog] = useState(false);
  const [targetItem, setTargetItem] = useState(null);
  const [time, setTime] = useState("");
  const mapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  /** ✅ 날짜 범위 생성 */
  useEffect(() => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const diff = end.diff(start, "day") + 1;
    const arr = Array.from({ length: diff }, (_, i) => start.add(i, "day").format("YYYY-MM-DD"));
    setDays(arr);
    setPlan(Object.fromEntries(arr.map((d) => [d, []])));
  }, [startDate, endDate]);

  /** ✅ KakaoMap 로드 */
  useEffect(() => {
    const loadMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => setIsMapLoaded(true));
      }
    };
    if (window.kakao?.maps) loadMap();
    else {
      const script = document.createElement("script");
      script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=64f77515cbf4b9bf257e664e44b1ab9b&libraries=services&autoload=false";
      script.async = true;
      script.onload = loadMap;
      document.head.appendChild(script);
    }
  }, []);

  /** ✅ 지도 표시 */
  const drawMap = useCallback(() => {
    if (!isMapLoaded) return;
    const { kakao } = window;
    const container = document.getElementById("plan-map");
    if (!container) return;
    const map = (mapRef.current = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(33.389, 126.531),
      level: 9,
    }));

    days.forEach((day) => {
      const items = plan[day] || [];
      const path = [];
      items.forEach((item, idx) => {
        if (!item.latitude || !item.longitude) return;
        const pos = new kakao.maps.LatLng(item.latitude, item.longitude);
        path.push(pos);
        new kakao.maps.Marker({ position: pos, map });
        const overlay = new kakao.maps.CustomOverlay({
          position: pos,
          content: `<div style="background:#fff;border:2px solid ${NAVI_BLUE};border-radius:50%;
            width:28px;height:28px;display:flex;align-items:center;justify-content:center;
            font-size:12px;font-weight:bold;color:${NAVI_BLUE}">${idx + 1}</div>`,
          yAnchor: 1.5,
        });
        overlay.setMap(map);
      });
      if (path.length > 1) {
        new kakao.maps.Polyline({
          path,
          strokeWeight: 4,
          strokeColor: NAVI_BLUE,
          strokeOpacity: 0.8,
          map,
        });
      }
    });
  }, [isMapLoaded, plan, days]);

  useEffect(() => {
    if (isMapLoaded) drawMap();
  }, [isMapLoaded, plan, drawMap]);

  /** ✅ 시간 설정 */
  const openTimeDialog = (item, day) => {
    if (isLocked) return;
    setTargetItem({ item, day });
    setTime(item.time || "");
    setTimeDialog(true);
  };

  const confirmTime = () => {
    const { item, day } = targetItem;
    const newPlan = { ...plan };
    newPlan[day] = newPlan[day].map((i) =>
      i === item ? { ...i, time } : i
    );
    setPlan(newPlan);
    setTimeDialog(false);
    toast.success("시간이 설정되었습니다!");
  };

  /** ✅ 항목 추가 (드래그 대신 단순 클릭 추가) */
  const addItem = (day, item) => {
    if (isLocked) return;
    const newPlan = { ...plan };
    newPlan[day] = [...(newPlan[day] || []), item];
    setPlan(newPlan);
    toast.success(`${item.title || item.name} 일정에 추가됨`);
  };

  /** ✅ 잠금 모드 전환 */
  const toggleLock = () => {
    setIsLocked(!isLocked);
    toast.info(isLocked ? "잠금 해제되었습니다" : "잠금 모드 활성화됨");
  };

  /** ✅ PDF 내보내기 */
  const exportPDF = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const img = new Image();
      img.src = logo;
      await new Promise((res) => (img.onload = res));
      const dateNow = dayjs().format("YYYY-MM-DD");
      pdf.addImage(img, "PNG", 80, 10, 50, 15);
      pdf.setFontSize(18);
      pdf.setTextColor(NAVI_BLUE);
      pdf.text("여행 일정표", 105, 35, { align: "center" });

      pdf.setFontSize(12);
      pdf.text(`여행 기간: ${startDate} ~ ${endDate}`, 15, 50);
      if (isLocked) pdf.text("🔒 잠금모드 - 수정불가", 15, 58);

      const mapEl = document.getElementById("plan-map");
      const canvas = await html2canvas(mapEl, { useCORS: true });
      const imgMap = canvas.toDataURL("image/png");
      pdf.addImage(imgMap, "PNG", 15, 65, 180, 100);

      let y = 175;
      days.forEach((day) => {
        pdf.setFontSize(14);
        pdf.setTextColor(NAVI_BLUE);
        pdf.text(day, 15, y);
        y += 7;
        pdf.setFontSize(11);
        (plan[day] || []).forEach((item, i) => {
          pdf.text(`${i + 1}. ${item.title || item.name} ${item.time ? `(${item.time})` : ""}`, 20, y);
          y += 6;
        });
        y += 4;
      });

      pdf.save(`여행계획_${dateNow}.pdf`);
      toast.success("PDF 저장 완료!");
    } catch (err) {
      console.error(err);
      toast.error("PDF 생성 실패");
    }
  };

  return (
    <MainLayout>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-screen">
        {/* 좌측 일정 구성 */}
        <div className="col-span-1 space-y-4">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={toggleLock}>
              {isLocked ? "🔓 잠금 해제" : "🔒 잠금 모드"}
            </Button>
            <Button variant="outline" onClick={exportPDF}>
              PDF 내보내기
            </Button>
          </div>

          {days.map((day) => (
            <Card key={day} className="p-4">
              <h3 className="font-semibold text-[#0A3D91] mb-2">{day}</h3>
              <div className="space-y-2">
                {(plan[day] || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-blue-50 rounded hover:bg-blue-100 cursor-pointer"
                    onClick={() => openTimeDialog(item, day)}
                  >
                    <span>
                      {idx + 1}. {item.title || item.name}
                    </span>
                    {item.time && (
                      <span className="text-xs text-gray-600">({item.time})</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* 지도 */}
        <div className="col-span-2 border rounded-lg shadow relative">
          <div id="plan-map" className="w-full h-[700px]" />
          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
              지도 불러오는 중...
            </div>
          )}
        </div>
      </div>

      {/* 🕒 시간 설정 팝업 */}
      <Dialog open={timeDialog} onOpenChange={setTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>방문 시간 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="time">시간 (HH:mm)</Label>
            <Input
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="예: 09:30"
              disabled={isLocked}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={confirmTime}
              disabled={isLocked}
              className="bg-[#0A3D91] text-white"
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default PlanStep4;
