import React, { useState, useEffect, useMemo, useRef } from "react";
import { List, Button, Empty, Input, Tabs, message } from "antd";
import TitleDateDisplay from "./TitleDateDisplay";
import Pagination from "@/common/components/travel/Pagination";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import api from "@/common/api/naviApi";

const { Search } = Input;
const { TabPane } = Tabs;

export default function TravelSelectDrawer({
  travels = [],
  title = "",
  dateRange = [],
  selectedTravels = [],
  setSelectedTravels = () => { },
}) {
  const [activeTab, setActiveTab] = useState("search");
  const [searchText, setSearchText] = useState("");
  const [sortType, setSortType] = useState("latest");
  const [myBookmarks, setMyBookmarks] = useState([]);

  // ✅ 페이지 관련 상태
  const [pageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageResult, setPageResult] = useState({
    page: 1,
    totalPages: 1,
    totalElements: 0,
    startPage: 1,
    endPage: 1,
    pageList: [],
  });

  /** ✅ 북마크 여행지 불러오기 */
  useEffect(() => {
    if (activeTab !== "my") return;
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          message.warning("로그인 후 이용 가능합니다.");
          return;
        }
        const res = await api.get("/travel/bookmarks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        setMyBookmarks(data);
      } catch (err) {
        console.error("❌ 북마크 여행지 불러오기 실패:", err);
        message.error("나의 여행지를 불러오지 못했습니다.");
      }
    };
    fetchBookmarks();
  }, [activeTab]);

  /** ✅ 검색 + 정렬 */
  const filteredTravels = useMemo(() => {
    let list = [...travels];
    const keyword = searchText.trim().toLowerCase();

    if (keyword) {
      // ✅ 검색어 공백 제거 + 소문자 처리
      const normalizedKeyword = keyword.replace(/\s+/g, "").toLowerCase();

      list = list.filter((t) => {
        // ✅ 여행지명 + 지역명 전체를 하나의 문자열로 합쳐서 비교
        const normalizedText = `${t.title || ""} ${t.region1Name || ""} ${t.region2Name || ""}`
          .replace(/\s+/g, "")
          .toLowerCase();

        // ✅ 부분 일치 허용 (공백 무시)
        return normalizedText.includes(normalizedKeyword);
      });
    }


    switch (sortType) {
      case "likes":
        return list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      case "views":
        return list.sort((a, b) => (b.views || 0) - (a.views || 0));
      default:
        return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }
  }, [travels, searchText, sortType]);

  /** ✅ 페이지네이션 계산 */
  useEffect(() => {
    const totalElements = filteredTravels.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    const startBlock = Math.floor((currentPage - 1) / 10) * 10 + 1;
    const endBlock = Math.min(startBlock + 9, totalPages);
    const pageList = Array.from({ length: endBlock - startBlock + 1 }, (_, i) => startBlock + i);

    setPageResult({
      page: currentPage,
      totalElements,
      totalPages,
      startPage: startBlock,
      endPage: endBlock,
      pageList,
    });
  }, [filteredTravels, currentPage, pageSize]);

  /** ✅ 현재 페이지 slice */
  const pagedTravels = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredTravels.slice(startIdx, startIdx + pageSize);
  }, [filteredTravels, currentPage, pageSize]);

  const listContainerRef = useRef(null);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= pageResult.totalPages) {
      setCurrentPage(page);

      // ✅ 리스트 스크롤을 맨 위로 이동
      if (listContainerRef.current) {
        listContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  /** ✅ 선택 toggle */
  const handleToggleSelect = (item) => {
    setSelectedTravels((prev) => {
      const exists = prev.some((v) => v.travelId === item.travelId);
      return exists
        ? prev.filter((v) => v.travelId !== item.travelId)
        : [...prev, item];
    });
  };

  /** ✅ 카드 렌더러 */
  const renderTravelItem = (item) => {
    const isSelected = selectedTravels.some((v) => v.travelId === item.travelId);
    const imageSrc =
      item.img?.trim() ||
      item.thumbnailPath?.trim() ||
      item.imagePath?.trim() ||
      `${API_SERVER_HOST}/images/travel/default.jpg`;

    return (
      <List.Item
        key={item.travelId}
        className="cursor-pointer"
        onClick={() => handleToggleSelect(item)}
      >
        <div
          className={`flex justify-between w-full items-center bg-white px-4 py-3 rounded-lg shadow-sm transition-all hover:shadow-md ${isSelected ? "ring-2 ring-[#0A3D91] ring-offset-1" : "border border-gray-200"
            }`}
        >
          <div className="flex items-center gap-3">
            <img
              src={imageSrc}
              alt={item.title}
              className="w-16 h-16 rounded-md object-cover"
              onError={(e) =>
                (e.target.src = "https://placehold.co/150x150?text=No+Image")
              }
            />
            <div className="min-w-0">
              <p className="font-semibold text-[#2F3E46] text-sm truncate">{item.title}</p>
              <p className="text-xs text-gray-500 truncate">
                {item.region1Name || "-"} {`>`} {item.region2Name || "-"}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>❤️ {item.likesCount?.toLocaleString?.() || 0}</span>
                <span>👁️ {item.views?.toLocaleString?.() || 0}</span>
              </div>
            </div>
          </div>
          {isSelected ? (
            <i className="bi bi-dash-square-fill text-red-500 text-xl"></i>
          ) : (
            <i className="bi bi-plus-square-fill text-[#0A3D91] text-xl"></i>
          )}
        </div>
      </List.Item>
    );
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      {/* 왼쪽: 탭 + 여행지 목록 */}
      <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-hidden">
        <TitleDateDisplay title={title} dateRange={dateRange} />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="px-4 pt-3 flex-shrink-0"
          items={[
            { key: "search", label: "장소 검색" },
            { key: "my", label: "나의 여행지" },
          ]}
        />

        {/* ✅ 왼쪽 탭별 콘텐츠는 별도 스크롤 */}
        <div ref={listContainerRef} className="flex-1 overflow-y-auto custom-scroll">
          {activeTab === "search" && (
            <div className="flex flex-col gap-3 px-4 mt-1 mb-2">
              <Search
                placeholder="장소명을 입력하세요"
                allowClear
                enterButton
                onSearch={(val) => setSearchText(val)}
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
              />

              {/* 정렬 영역 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  총{" "}
                  <span className="font-semibold text-[#0A3D91]">
                    {filteredTravels.length}
                  </span>{" "}
                  개
                </span>
                <div className="space-x-2">
                  {[
                    { key: "latest", label: "최신순" },
                    { key: "likes", label: "인기순" },
                    { key: "views", label: "조회순" },
                  ].map((btn) => (
                    <Button
                      key={btn.key}
                      type={sortType === btn.key ? "primary" : "default"}
                      size="small"
                      className={
                        sortType === btn.key
                          ? "bg-[#0A3D91] border-none text-white"
                          : "text-gray-600"
                      }
                      onClick={() => setSortType(btn.key)}
                    >
                      {btn.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* ✅ 여행지 리스트 */}
              <div className="flex-1 overflow-y-auto custom-scroll pb-4">
                <List
                  dataSource={pagedTravels}
                  locale={{ emptyText: <Empty description="검색 결과가 없습니다." /> }}
                  renderItem={renderTravelItem}
                />
                {pageResult.totalPages > 1 && (
                  <Pagination
                    pageResult={pageResult}
                    handlePageClick={handlePageClick}
                    loading={false}
                  />
                )}
              </div>
            </div>
          )}

          {/* 나의 여행지 탭 */}
          {activeTab === "my" && (
            <div className="px-4 pb-4">
              <List
                dataSource={myBookmarks}
                locale={{
                  emptyText: <Empty description="북마크한 여행지가 없습니다." />,
                }}
                renderItem={renderTravelItem}
              />
            </div>
          )}
        </div>
      </div>

      {/* ✅ 오른쪽: 선택된 여행지 요약 (독립 스크롤) */}
      <div className="p-5 flex-shrink-0 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-[#2F3E46]">
              📍 선택한 여행지
            </h3>
            <p className="text-sm text-gray-500">
              총 {selectedTravels.length}개
            </p>

            {/* ✅ 여행일수보다 적을 때 경고 */}
            {days.length > 0 && selectedTravels.length < days.length && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                ⚠️ 여행일수({days.length}일)에 비해 선택된 여행지가 부족합니다.
              </p>
            )}
          </div>
          <Button
            type="text"
            className="text-red-500 hover:text-red-600 font-semibold"
            onClick={() => setSelectedTravels([])}
          >
            초기화
          </Button>
        </div>
      </div>


      {/* ✅ 이 부분만 따로 스크롤 */}
      <div className="flex-1 overflow-y-auto custom-scroll p-5">
        <List
          dataSource={selectedTravels}
          locale={{
            emptyText: <Empty description="선택된 여행지가 없습니다." />,
          }}
          renderItem={(item) => (
            <List.Item>
              <div className="flex justify-between items-center w-full bg-white px-4 py-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      item.img?.trim() ||
                      item.thumbnailPath?.trim() ||
                      item.imagePath?.trim() ||
                      "https://placehold.co/150x150?text=No+Image"
                    }
                    alt={item.title}
                    className="w-14 h-14 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm text-[#2F3E46]">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.region1Name || "-"} {`>`}{" "}
                      {item.region2Name || "-"}
                    </p>
                  </div>
                </div>
                <i
                  className="bi bi-dash-square-fill text-red-500 text-xl cursor-pointer"
                  onClick={() =>
                    setSelectedTravels((prev) =>
                      prev.filter((v) => v.travelId !== item.travelId)
                    )
                  }
                ></i>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}
