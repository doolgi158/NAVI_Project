import React, { useState, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../common/api/naviApi";

const NAVI_BLUE = "#0A3D91";

const PlanStep2 = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { startDate, endDate } = state || {};
  const mapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [tab, setTab] = useState("search");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [myPlaces, setMyPlaces] = useState([]);
  const [selected, setSelected] = useState([]);

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
    const container = document.getElementById("travel-map");
    const map = (mapRef.current = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(33.389, 126.531),
      level: 9,
    }));

    selected.forEach((place) => {
      if (!place.latitude || !place.longitude) return;
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(place.latitude, place.longitude),
      });
      marker.setMap(map);
    });
  }, [isMapLoaded, selected]);

  /** ✅ 여행지 검색 */
  const handleSearch = async () => {
    if (!search.trim()) {
      toast.warning("검색어를 입력하세요!");
      return;
    }
    try {
      const res = await api.get(`/travel/search?keyword=${search}`);
      setSearchResults(res.data || []);
    } catch (err) {
      toast.error("검색 중 오류가 발생했습니다.");
    }
  };

  /** ✅ 나의 여행지 불러오기 */
  useEffect(() => {
    const fetchMyPlaces = async () => {
      try {
        const res = await api.get("/travel/bookmarks");
        setMyPlaces(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMyPlaces();
  }, []);

  /** ✅ 여행지 선택/해제 */
  const toggleSelect = (place) => {
    const exists = selected.some((p) => p.id === place.id);
    if (exists) {
      setSelected(selected.filter((p) => p.id !== place.id));
    } else {
      setSelected([...selected, place]);
    }
  };

  /** ✅ 다음 단계 이동 */
  const handleNext = () => {
    if (selected.length === 0) {
      toast.warning("여행지를 한 곳 이상 선택해주세요!");
      return;
    }
    navigate("/plans/step3", {
      state: { startDate, endDate, selectedPlaces: selected },
    });
  };

  /** ✅ 선택된 여부 확인 */
  const isSelected = (placeId) => selected.some((p) => p.id === placeId);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 min-h-screen p-6 gap-6">
        {/* 왼쪽: 검색 및 리스트 */}
        <div className="col-span-1">
          <Card className="p-4 shadow-md border border-gray-200">
            <Tabs defaultValue="search" onValueChange={setTab}>
              <TabsList className="grid grid-cols-2 mb-4 bg-blue-50 rounded-lg">
                <TabsTrigger value="search">장소 검색</TabsTrigger>
                <TabsTrigger value="my">나의 여행지 목록</TabsTrigger>
              </TabsList>

              {/* 🔍 장소 검색 */}
              <TabsContent value="search">
                <div className="flex gap-2 mb-4">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="여행지를 입력하세요"
                    className="border-gray-300"
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
                    searchResults.map((place) => (
                      <Card
                        key={place.id}
                        className={`p-3 flex justify-between items-center cursor-pointer border ${
                          isSelected(place.id)
                            ? "border-[#0A3D91] bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => toggleSelect(place)}
                      >
                        <div>
                          <p className="font-medium">{place.title}</p>
                          <p className="text-xs text-gray-500">
                            {place.addr1}
                          </p>
                        </div>
                        {isSelected(place.id) && (
                          <Badge variant="outline" className="text-[#0A3D91]">
                            선택됨
                          </Badge>
                        )}
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">
                      검색 결과가 없습니다.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* ⭐ 나의 여행지 목록 */}
              <TabsContent value="my">
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {myPlaces.length > 0 ? (
                    myPlaces.map((place) => (
                      <Card
                        key={place.id}
                        className={`p-3 flex justify-between items-center cursor-pointer border ${
                          isSelected(place.id)
                            ? "border-[#0A3D91] bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => toggleSelect(place)}
                      >
                        <div>
                          <p className="font-medium">{place.title}</p>
                          <p className="text-xs text-gray-500">
                            {place.addr1}
                          </p>
                        </div>
                        {isSelected(place.id) && (
                          <Badge variant="outline" className="text-[#0A3D91]">
                            선택됨
                          </Badge>
                        )}
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">
                      북마크된 여행지가 없습니다.
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

        {/* 오른쪽: 지도 */}
        <div className="col-span-2 border rounded-lg shadow relative">
          <div id="travel-map" className="w-full h-[700px]" />
          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
              지도를 불러오는 중...
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PlanStep2;
