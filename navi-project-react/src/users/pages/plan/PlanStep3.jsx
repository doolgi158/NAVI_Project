import React, { useEffect, useRef, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../common/api/naviApi";

const NAVI_BLUE = "#0A3D91";

const PlanStep3 = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { startDate, endDate, selectedPlaces } = state || {};
  const mapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [tab, setTab] = useState("search");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [reservedHotels, setReservedHotels] = useState([]);
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentHotel, setCurrentHotel] = useState(null);
  const [stayNights, setStayNights] = useState(1);

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
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=64f77515cbf4b9bf257e664e44b1ab9b&libraries=services&autoload=false";
      script.async = true;
      script.onload = loadMap;
      document.head.appendChild(script);
    }
  }, []);

  /** ✅ 지도 표시 */
  useEffect(() => {
    if (!isMapLoaded) return;
    const { kakao } = window;
    const container = document.getElementById("hotel-map");
    const map = (mapRef.current = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(33.389, 126.531),
      level: 9,
    }));

    selectedHotels.forEach((hotel) => {
      if (!hotel.latitude || !hotel.longitude) return;
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(hotel.latitude, hotel.longitude),
      });
      marker.setMap(map);
    });
  }, [isMapLoaded, selectedHotels]);

  /** ✅ 숙소 검색 */
  const handleSearch = async () => {
    if (!search.trim()) return toast.warning("숙소명을 입력해주세요!");
    try {
      const res = await api.get(`/hotel/search?keyword=${search}`);
      setSearchResults(res.data || []);
    } catch (err) {
      toast.error("검색 중 오류가 발생했습니다.");
    }
  };

  /** ✅ 예약 숙소 불러오기 */
  useEffect(() => {
    const fetchReserved = async () => {
      try {
        const res = await api.get("/hotel/reserved");
        setReservedHotels(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReserved();
  }, []);

  /** ✅ 숙소 선택 (팝업 열기) */
  const selectHotel = (hotel) => {
    setCurrentHotel(hotel);
    setStayNights(1);
    setOpenDialog(true);
  };

  /** ✅ 숙소 추가 */
  const confirmHotel = () => {
    const exists = selectedHotels.some((h) => h.id === currentHotel.id);
    if (exists) {
      toast.warning("이미 선택된 숙소입니다.");
      return;
    }
    const newHotel = { ...currentHotel, stayNights };
    setSelectedHotels([...selectedHotels, newHotel]);
    setOpenDialog(false);
    toast.success("숙소가 추가되었습니다!");
  };

  /** ✅ 숙소 선택 해제 */
  const removeHotel = (id) => {
    setSelectedHotels(selectedHotels.filter((h) => h.id !== id));
  };

  /** ✅ 다음 단계 이동 */
  const handleNext = () => {
    if (selectedHotels.length === 0) {
      toast.warning("숙소를 한 곳 이상 선택해주세요!");
      return;
    }
    navigate("/plans/step4", {
      state: {
        startDate,
        endDate,
        selectedPlaces,
        selectedHotels,
      },
    });
  };

  /** ✅ 선택 확인 */
  const isSelected = (hotelId) => selectedHotels.some((h) => h.id === hotelId);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 min-h-screen p-6 gap-6">
        {/* 왼쪽 */}
        <div className="col-span-1">
          <Card className="p-4 shadow-md border border-gray-200">
            <Tabs defaultValue="search" onValueChange={setTab}>
              <TabsList className="grid grid-cols-2 mb-4 bg-blue-50 rounded-lg">
                <TabsTrigger value="search">숙소 검색</TabsTrigger>
                <TabsTrigger value="reserved">예약 목록</TabsTrigger>
              </TabsList>

              {/* 🔍 숙소 검색 */}
              <TabsContent value="search">
                <div className="flex gap-2 mb-4">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="숙소명을 입력하세요"
                  />
                  <Button
                    className="bg-[#0A3D91] hover:bg-[#0A3D91]/90 text-white"
                    onClick={handleSearch}
                  >
                    검색
                  </Button>
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((hotel) => (
                      <Card
                        key={hotel.id}
                        className={`p-3 flex justify-between items-center cursor-pointer border ${
                          isSelected(hotel.id)
                            ? "border-[#0A3D91] bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => selectHotel(hotel)}
                      >
                        <div>
                          <p className="font-medium">{hotel.title}</p>
                          <p className="text-xs text-gray-500">
                            {hotel.addr1}
                          </p>
                        </div>
                        {isSelected(hotel.id) && (
                          <Badge variant="outline" className="text-[#0A3D91]">
                            선택됨
                          </Badge>
                        )}
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">검색 결과가 없습니다.</p>
                  )}
                </div>
              </TabsContent>

              {/* ⭐ 예약 목록 */}
              <TabsContent value="reserved">
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {reservedHotels.length > 0 ? (
                    reservedHotels.map((hotel) => (
                      <Card
                        key={hotel.id}
                        className={`p-3 flex justify-between items-center cursor-pointer border ${
                          isSelected(hotel.id)
                            ? "border-[#0A3D91] bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => selectHotel(hotel)}
                      >
                        <div>
                          <p className="font-medium">{hotel.title}</p>
                          <p className="text-xs text-gray-500">
                            {hotel.addr1}
                          </p>
                        </div>
                        {isSelected(hotel.id) && (
                          <Badge variant="outline" className="text-[#0A3D91]">
                            선택됨
                          </Badge>
                        )}
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">
                      예약된 숙소가 없습니다.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* 다음 버튼 */}
          <Button
            className="mt-4 w-full bg-[#0A3D91] hover:bg-[#0A3D91]/90 text-white py-5 rounded-lg"
            onClick={handleNext}
          >
            다음 단계 →
          </Button>
        </div>

        {/* 오른쪽 지도 */}
        <div className="col-span-2 border rounded-lg shadow relative">
          <div id="hotel-map" className="w-full h-[700px]" />
          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
              지도를 불러오는 중...
            </div>
          )}
        </div>
      </div>

      {/* 🏨 숙소 선택 팝업 */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>숙소 일정 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <p className="text-sm text-gray-600">
              선택 숙소:{" "}
              <span className="font-semibold text-[#0A3D91]">
                {currentHotel?.title}
              </span>
            </p>
            <div className="flex items-center gap-3">
              <Label htmlFor="nights">숙박일 수</Label>
              <Input
                id="nights"
                type="number"
                min={1}
                max={30}
                value={stayNights}
                onChange={(e) => setStayNights(parseInt(e.target.value) || 1)}
                className="w-24"
              />
              <span>박</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="bg-[#0A3D91] text-white"
              onClick={confirmHotel}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default PlanStep3;
