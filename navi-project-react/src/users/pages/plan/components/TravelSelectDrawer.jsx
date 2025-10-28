import React, { useState, useEffect, useMemo, useRef } from "react";
import { List, Button, Empty, Input, Tabs, message } from "antd";
import TitleDateDisplay from "./TitleDateDisplay";
import Pagination from "@/common/components/travel/Pagination";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import api from "@/common/api/naviApi";

const { Search } = Input;

export default function TravelSelectDrawer({
  travels = [],
  title = "",
  dateRange = [],
  selectedTravels = [],
  setSelectedTravels = () => { },
  days = [],
}) {
  const [activeTab, setActiveTab] = useState("search");
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [myBookmarks, setMyBookmarks] = useState([]);
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

  const listContainerRef = useRef(null);

  // ✅ 카테고리 목록 (원하는 항목 추가 가능)
  const categories = ["전체", "관광지", "음식점", "쇼핑"];

  /** ✅ 북마크 여행지 불러오기 */
  useEffect(() => {
    if (activeTab !== "my") return;

    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const userNo = localStorage.getItem("userNo");

        if (!token || !userNo) {
          message.warning("로그인 후 이용 가능합니다.");
          return;
        }

        const res = await api.get(`/activity/bookmarks?userNo=${userNo}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const bookmarks = Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        setMyBookmarks(bookmarks);
        console.log("✅ 나의 북마크 여행지 불러오기 성공:", bookmarks.length);
      } catch (err) {
        console.error("❌ 북마크 여행지 불러오기 실패:", err);
        message.error("나의 여행지를 불러오지 못했습니다.");
      }
    };

    fetchBookmarks();
  }, [activeTab]);

  /** ✅ 검색 + 카테고리 필터링 */
  const filteredTravels = useMemo(() => {
    let list = [...travels];
    const keyword = searchText.trim().toLowerCase();

    // 🔍 검색어 필터링
    if (keyword) {
      const normalizedKeyword = keyword.replace(/\s+/g, "").toLowerCase();
      list = list.filter((t) => {
        const normalizedText = `${t.title || ""} ${t.region1Name || ""} ${t.region2Name || ""
          }`
          .replace(/\s+/g, "")
          .toLowerCase();
        return normalizedText.includes(normalizedKeyword);
      });
    }

    // 🎯 카테고리 필터링
    if (categoryFilter !== "전체") {
      list = list.filter(
        (t) =>
          t.categoryName &&
          t.categoryName.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    return list;
  }, [travels, searchText, categoryFilter]);

  /** ✅ 페이지네이션 계산 */
  useEffect(() => {
    const totalElements = filteredTravels.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    const startBlock = Math.floor((currentPage - 1) / 10) * 10 + 1;
    const endBlock = Math.min(startBlock + 9, totalPages);
    const pageList = Array.from(
      { length: endBlock - startBlock + 1 },
      (_, i) => startBlock + i
    );

    setPageResult({
      page: currentPage,
      totalElements,
      totalPages,
      startPage: startBlock,
      endPage: endBlock,
      pageList,
    });
  }, [filteredTravels, currentPage, pageSize]);

  /** ✅ 현재 페이지 데이터 */
  const pagedTravels = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredTravels.slice(startIdx, startIdx + pageSize);
  }, [filteredTravels, currentPage, pageSize]);

  /** ✅ 리스트 클릭시 페이지 맨 위로 */
  const handlePageClick = (page) => {
    if (page >= 1 && page <= pageResult.totalPages) {
      setCurrentPage(page);
      if (listContainerRef.current) {
        listContainerRef.current.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  };

  /** ✅ 카테고리 변경 시 페이지 리셋 + 스크롤 맨 위로 이동 */
  const handleCategoryChange = (cat) => {
    setCategoryFilter(cat);
    setCurrentPage(1);
    if (listContainerRef.current) {
      listContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /** ✅ 여행지 선택/해제 */
  const handleToggleSelect = (item) => {
    setSelectedTravels((prev) => {
      const exists = prev.some((v) => v.travelId === item.travelId);
      return exists
        ? prev.filter((v) => v.travelId !== item.travelId)
        : [...prev, item];
    });
  };

  /** ✅ 공통 렌더링 함수 */
  const renderTravelItem = (item) => {
    const isSelected = selectedTravels.some(
      (v) => v.travelId === item.travelId
    );
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
          className={`flex justify-between w-full items-center bg-white px-4 py-3 rounded-lg shadow-sm transition-all hover:shadow-md ${isSelected
              ? "ring-2 ring-[#0A3D91] ring-offset-1"
              : "border border-gray-200"
            }`}
        >
          <div className="flex items-center gap-3">
            <img
              src={imageSrc}
              alt={item.title}
              className="w-20 h-16 rounded-xl object-cover"
              onError={(e) =>
                (e.target.src = "https://placehold.co/150x150?text=No+Image")
              }
            />
            <div className="min-w-0">
              <p className="font-semibold text-[#2F3E46] text-sm truncate">
                {item.title}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {item.region1Name || "-"} &gt; {item.region2Name || "-"}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>🏷️ {item.categoryName || "기타"}</span>
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
      {/* 왼쪽 패널 */}
      <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-hidden bg-[#FDFCF9] ">
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

        <div className="flex-1 overflow-y-auto custom-scroll">
          {activeTab === "search" && (
            <div className="flex flex-col h-full">
              {/* ✅ 고정 영역 (검색 + 카테고리 + 개수) */}
              <div className="sticky top-0 z-10 px-4 pt-2 pb-3 border-b border-gray-200 shadow-sm ">
                {/* 🔍 검색 입력 */}
                <Search
                  placeholder="장소명을 입력하세요"
                  allowClear
                  enterButton
                  onSearch={(val) => {
                    setSearchText(val);
                    setCurrentPage(1);
                    if (listContainerRef.current)
                      listContainerRef.current.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                  }}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1);
                    if (listContainerRef.current)
                      listContainerRef.current.scrollTo({
                        top: 0,
                        behavior: "auto",
                      });
                  }}
                  value={searchText}
                />

                {/* 🎯 카테고리 필터 */}
                <div className="flex flex-wrap gap-2 my-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      size="small"
                      type={categoryFilter === cat ? "primary" : "default"}
                      className={
                        categoryFilter === cat
                          ? "bg-[#0A3D91] border-none text-white"
                          : "text-gray-600"
                      }
                      onClick={() => handleCategoryChange(cat)} // ✅ 수정된 부분
                    >
                      {cat}
                    </Button>
                  ))}
                </div>

                {/* ✅ 총 개수 고정 */}
                <div className="text-gray-600 text-sm">
                  총{" "}
                  <span className="font-semibold text-[#0A3D91]">
                    {filteredTravels.length.toLocaleString()}
                  </span>{" "}
                  개
                </div>
              </div>

              {/* ✅ 리스트만 스크롤 */}
              <div
                ref={listContainerRef}
                className="flex-1 overflow-y-auto custom-scroll px-4 pb-4"
              >
                <List
                  dataSource={pagedTravels}
                  locale={{
                    emptyText: <Empty description="검색 결과가 없습니다." />,
                  }}
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

          {/* ✅ 나의 여행지 탭 */}
          {activeTab === "my" && (
            <div className="flex flex-col gap-3 px-4 mt-1 mb-2">
              <div className="text-gray-600 text-sm mb-2">
                총{" "}
                <span className="font-semibold text-[#0A3D91]">
                  {myBookmarks.length.toLocaleString()}
                </span>{" "}
                개
              </div>
              <div className="flex-1 overflow-y-auto custom-scroll  pb-4">
                <List
                  dataSource={myBookmarks}
                  locale={{
                    emptyText: <Empty description="북마크한 여행지가 없습니다." />,
                  }}
                  renderItem={renderTravelItem}
                />
              </div>
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
          </div>
          <Button
            type="text"
            className="text-red-500 hover:text-red-600 font-semibold"
            onClick={() => setSelectedTravels([])}
          >
            초기화
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll pt-5 truncate w-[350px]">
          <List
            dataSource={selectedTravels}
            locale={{
              emptyText: <Empty description="선택된 여행지가 없습니다." />,
            }}
            renderItem={(item) => (
              <List.Item>
                <div className="flex justify-between items-center w-full bg-white px-4 py-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 ">
                    <img
                      src={
                        item.img?.trim() ||
                        item.thumbnailPath?.trim() ||
                        item.imagePath?.trim() ||
                        "https://placehold.co/150x150?text=No+Image"
                      }
                      alt={item.title}
                      className="w-20 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm text-[#2F3E46]">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.region1Name || "-"} &gt; {item.region2Name || "-"}
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
    </div>
  );
}
