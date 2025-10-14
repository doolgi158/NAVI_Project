import React, { useEffect, useState, useRef, useCallback } from "react";
import MainLayout from "../../layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import dayjs from "dayjs";
import api from "../../../common/api/naviApi";
import logo from "../../images/navi_logo.png";

const NAVI_BLUE = "#0A3D91";

const SharedPlan = () => {
  const { planId } = useParams();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  /** ✅ Kakao Map 로드 */
  useEffect(() => {
    const loadMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => setIsMapLoaded(true));
      }
    };
    if (window.kakao?.maps) loadMap();
    else {
      const script = document.createElement("script");
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=64f77515cbf4b9bf257e664e44b1ab9b&libraries=services&autoload=false";
      script.async = true;
      script.onload = loadMap;
      document.head.appendChild(script);
    }
  }, []);

  /** ✅ 여행계획 불러오기 */
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get(`/travelplan/detail/${planId}`);
        setPlanData(res.data);
      } catch {
        toast.error("여행계획을 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId]);

  /** ✅ 지도 표시 */
  const drawMap = useCallback(() => {
    if (!isMapLoaded || !planData) return;
    const { kakao } = window;
    const container = document.getElementById("shared-map");
    if (!container) return;

    const map = (mapRef.current =
      mapRef.current ||
      new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(33.389, 126.531),
        level: 9,
      }));

    const bounds = new kakao.maps.LatLngBounds();
    planData.days?.forEach((day) => {
      const path = [];
      day.items?.forEach((item, idx) => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lng);
        if (isNaN(lat) || isNaN(lng)) return;
        const pos = new kakao.maps.LatLng(lat, lng);
        bounds.extend(pos);
        path.push(pos);
        new kakao.maps.Marker({
          position: pos,
          map,
        });
        const overlay = new kakao.maps.CustomOverlay({
          position: pos,
          content: `
            <div style="background:#fff;border:2px solid ${NAVI_BLUE};border-radius:50%;
              width:26px;height:26px;display:flex;align-items:center;
              justify-content:center;font-size:12px;font-weight:bold;color:${NAVI_BLUE};">
              ${idx + 1}
            </div>`,
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

    if (!bounds.isEmpty()) map.setBounds(bounds);
  }, [isMapLoaded, planData]);

  useEffect(() => {
    if (isMapLoaded && planData) drawMap();
  }, [isMapLoaded, planData, drawMap]);

  /** ✅ PDF 내보내기 */
  const exportPDF = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const img = new Image();
      img.src = logo;
      await new Promise((res) => (img.onload = res));

      pdf.addImage(img, "PNG", 80, 10, 50, 15);
      pdf.setFontSize(18);
      pdf.setTextColor(NAVI_BLUE);
      pdf.text("공유된 여행 일정표", 105, 35, { align: "center" });

      pdf.setFontSize(12);
      pdf.text(`여행 기간: ${planData.startDate} ~ ${planData.endDate}`, 15, 50);
      pdf.text(`생성일: ${dayjs().format("YYYY-MM-DD")}`, 15, 58);

      const mapEl = document.getElementById("shared-map");
      const canvas = await html2canvas(mapEl, { useCORS: true });
      const imgMap = canvas.toDataURL("image/png");
      pdf.addImage(imgMap, "PNG", 15, 65, 180, 100);

      let y = 175;
      planData.days?.forEach((day) => {
        pdf.setFontSize(14);
        pdf.setTextColor(NAVI_BLUE);
        pdf.text(day.date, 15, y);
        y += 7;
        pdf.setFontSize(11);
        pdf.setTextColor("#000");
        day.items?.forEach((item, i) => {
          pdf.text(`${i + 1}. ${item.name || item.title}`, 20, y);
          y += 6;
        });
        y += 4;
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
      });

      pdf.save(`공유여행계획_${dayjs().format("YYYY-MM-DD")}.pdf`);
      toast.success("PDF로 내보내기 완료!");
    } catch (err) {
      toast.error("PDF 생성 실패");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen text-gray-500">
          여행계획 불러오는 중...
        </div>
      </MainLayout>
    );
  }

  if (!planData) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen text-gray-500">
          공유된 여행계획을 찾을 수 없습니다.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <h2 className="text-2xl font-bold text-[#0A3D91] mb-2">공유된 여행 계획</h2>
        <p className="text-gray-600 mb-6">
          여행 기간: {planData.startDate} ~ {planData.endDate}
        </p>

        <div id="shared-map" className="w-full h-[500px] border rounded-lg shadow mb-8" />

        {/* 일정 리스트 */}
        <div className="space-y-4">
          {planData.days?.map((day) => (
            <Card key={day.date} className="p-4">
              <h3 className="text-[#0A3D91] font-semibold mb-2">{day.date}</h3>
              {day.items?.length ? (
                <ul className="space-y-1">
                  {day.items.map((item, i) => (
                    <li key={i} className="text-gray-700 text-sm">
                      {i + 1}. {item.name || item.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">등록된 일정이 없습니다.</p>
              )}
            </Card>
          ))}
        </div>

        {/* PDF 버튼 */}
        <div className="flex justify-center mt-10">
          <Button
            className="bg-[#0A3D91] hover:bg-[#0A3D91]/90 text-white px-8 py-5 rounded-lg text-lg"
            onClick={exportPDF}
          >
            PDF로 내보내기
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default SharedPlan;
