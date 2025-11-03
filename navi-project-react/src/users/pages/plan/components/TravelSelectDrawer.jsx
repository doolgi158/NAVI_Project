import React, { useState, useEffect, useMemo, useRef } from "react";
import { List, Button, Empty, Input, Tabs, message, Spin } from "antd";
import TitleDateDisplay from "./TitleDateDisplay";
import Pagination from "@/common/components/travel/Pagination";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import api from "@/common/api/naviApi";
import TravelFilterModal from "@/users/pages/plan/components/TravelFilterModal";

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
  const [regionFilterQuery, setRegionFilterQuery] = useState({ region2Name: [] }); // ✅ 모달용 필터 상태 추가
  const [filterOpen, setFilterOpen] = useState(false); // ✅ 모달 열림 상태
  const [myBookmarks, setMyBookmarks] = useState([]);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkPage, setBookmarkPage] = useState(1);
  const [pageResult, setPageResult] = useState({
    page: 1,
    totalPages: 1,
    totalElements: 0,
    startPage: 1,
    endPage: 1,
    pageList: [],
  });

  const listContainerRef = useRef(null);



  /** ✅ 북마크 불러오기 */
  useEffect(() => {
    if (activeTab !== "my" || myBookmarks.length > 0) return;
    const fetchBookmarks = async () => {
      try {
        setBookmarkLoading(true);
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
      } catch (err) {
        console.error("❌ 북마크 여행지 불러오기 실패:", err);
        message.error("나의 여행지를 불러오지 못했습니다.");
      } finally {
        setBookmarkLoading(false);
      }
    };

    fetchBookmarks();
  }, [activeTab]);

  /** ✅ 검색 + 필터 */
  const filteredTravels = useMemo(() => {
    let list = [...travels];
    const keyword = searchText.trim().toLowerCase();

    if (keyword) {
      const normalizedKeyword = keyword.replace(/\s+/g, "").toLowerCase();
      list = list.filter((t) => {
        const normalizedText = `${t.title || ""} ${t.region1Name || ""} ${t.region2Name || ""}`
          .replace(/\s+/g, "")
          .toLowerCase();
        return normalizedText.includes(normalizedKeyword);
      });
    }

    if (categoryFilter !== "전체") {
      list = list.filter(
        (t) =>
          t.categoryName &&
          t.categoryName.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // ✅ 모달로 적용된 지역 필터 반영
    if (regionFilterQuery.region2Name?.length > 0) {
      list = list.filter((t) =>
        regionFilterQuery.region2Name.some((r2) =>
          (t.region2Name || "").includes(r2)
        )
      );
    }

    return list;
  }, [travels, searchText, categoryFilter, regionFilterQuery]);

  /** ✅ 페이지 계산 */
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

  /** ✅ 북마크 페이지 계산 */
  const pagedBookmarks = useMemo(() => {
    const startIdx = (bookmarkPage - 1) * pageSize;
    return myBookmarks.slice(startIdx, startIdx + pageSize);
  }, [myBookmarks, bookmarkPage, pageSize]);

  const bookmarkPageResult = useMemo(() => {
    const totalElements = myBookmarks.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    const startBlock = Math.floor((bookmarkPage - 1) / 10) * 10 + 1;
    const endBlock = Math.min(startBlock + 9, totalPages);
    const pageList = Array.from(
      { length: endBlock - startBlock + 1 },
      (_, i) => startBlock + i
    );
    return {
      page: bookmarkPage,
      totalElements,
      totalPages,
      startPage: startBlock,
      endPage: endBlock,
      pageList,
    };
  }, [myBookmarks, bookmarkPage, pageSize]);

  const handleBookmarkPageClick = (page) => {
    if (page >= 1 && page <= bookmarkPageResult.totalPages) {
      setBookmarkPage(page);
      if (listContainerRef.current) {
        listContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  /** ✅ 리스트 페이지 계산 */
  const pagedTravels = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredTravels.slice(startIdx, startIdx + pageSize);
  }, [filteredTravels, currentPage, pageSize]);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= pageResult.totalPages) {
      setCurrentPage(page);
      if (listContainerRef.current)
        listContainerRef.current.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  const handleCategoryChange = (cat) => {
    setCategoryFilter(cat);
    setCurrentPage(1);
    if (listContainerRef.current) {
      listContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /** ✅ 필터 변경 시 1페이지 + 최상단으로 스크롤 */
  useEffect(() => {
    // 카테고리나 지역 필터가 바뀌면 1페이지로 이동
    setCurrentPage(1);

    // 스크롤을 최상단으로 이동
    if (listContainerRef.current) {
      listContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [categoryFilter, regionFilterQuery]);


  const handleToggleSelect = (item) => {
    setSelectedTravels((prev) => {
      const exists = prev.some((v) => v.travelId === item.travelId);
      return exists
        ? prev.filter((v) => v.travelId !== item.travelId)
        : [...prev, item];
    });
  };

  /** ✅ 아이템 렌더링 */
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
    <>
      <div className="flex h-full w-full bg-white overflow-hidden">
        {/* 왼쪽 패널 */}
        <div className="w-[380px] border-r border-gray-200 flex flex-col overflow-hidden bg-[#FDFCF9]">
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
                {/* ✅ 검색 영역 */}
                <div className="sticky top-0 z-10 px-4 pt-2 pb-3 border-b border-gray-200 shadow-sm ">
                  <Search
                    placeholder="장소명을 입력하세요"
                    allowClear
                    enterButton
                    onSearch={(val) => setSearchText(val)}
                    onChange={(e) => setSearchText(e.target.value)}
                    value={searchText}
                  />

                  {/* ✅ 모달 버튼 추가 */}
                  <div className="flex justify-end mt-2">
                    <Button
                      size="small"
                      className="border-[#0A3D91] text-[#0A3D91]"
                      onClick={() => setFilterOpen(true)}
                    >
                      고급 필터
                    </Button>
                  </div>


                  {/* ✅ 총 개수 */}
                  <div className="text-gray-600 text-sm mt-1">
                    총{" "}
                    <span className="font-semibold text-[#0A3D91]">
                      {filteredTravels.length.toLocaleString()}
                    </span>{" "}
                    개
                  </div>

                  {/* ✅ 선택된 필터 표시 */}
                  <div className="text-xs text-gray-500 mt-1">
                    {categoryFilter === "전체" && (!regionFilterQuery.region2Name || regionFilterQuery.region2Name.length === 0)
                      ? "현재 필터: 전체 보기"
                      : (
                        <>
                          현재 필터:{" "}
                          {categoryFilter !== "전체" && <span className="font-medium text-[#0A3D91]">{categoryFilter}</span>}
                          {regionFilterQuery.region2Name?.length > 0 && (
                            <>
                              {" / "}
                              <span className="font-medium text-[#0A3D91]">
                                {regionFilterQuery.region2Name.join(", ")}
                              </span>
                            </>
                          )}
                        </>
                      )
                    }
                  </div>
                </div>

                {/* ✅ 리스트 + 페이지네이션 분리 */}
                <div className="flex flex-col flex-1 overflow-hidden">
                  {/* 리스트 영역 */}
                  <div
                    ref={listContainerRef}
                    className="flex-1 overflow-y-auto custom-scroll px-4 pb-2"
                  >
                    <List
                      dataSource={pagedTravels}
                      locale={{
                        emptyText: <Empty description="검색 결과가 없습니다." />,
                      }}
                      renderItem={renderTravelItem}
                    />
                  </div>

                  {/* 페이지네이션 영역 (항상 하단 고정, 짤리지 않음) */}
                  {pageResult.totalPages > 1 && (
                    <div className="py-3 px-4 flex justify-center">
                      <div className="flex flex-wrap justify-center gap-1 w-full max-w-full">
                        <Pagination
                          pageResult={pageResult}
                          handlePageClick={handlePageClick}
                          loading={false}
                          visibleCount={5}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ✅ 나의 여행지 탭 */}
            {activeTab === "my" && (
              <div className="flex flex-col h-full overflow-hidden">
                {bookmarkLoading ? (
                  <div className="flex justify-center items-center flex-1 text-gray-500">
                    <Spin size="large" tip="북마크를 불러오는 중입니다..." />
                  </div>
                ) : (
                  <>
                    <div className="sticky top-0 z-10 bg-[#FDFCF9] px-4 pt-3 pb-2 border-b border-gray-200 shadow-sm">
                      <div className="text-gray-600 text-sm">
                        총{" "}
                        <span className="font-semibold text-[#0A3D91]">
                          {myBookmarks.length.toLocaleString()}
                        </span>{" "}
                        개
                      </div>
                    </div>

                    {/* ✅ 리스트 + 페이지네이션 포함 영역 */}
                    <div className="flex flex-col flex-1 overflow-hidden">
                      {/* 리스트 영역 */}
                      <div className="flex-1 overflow-y-auto custom-scroll px-4 pb-2">
                        <List
                          dataSource={pagedBookmarks}
                          locale={{
                            emptyText: (
                              <Empty description="북마크한 여행지가 없습니다." />
                            ),
                          }}
                          renderItem={renderTravelItem}
                        />
                      </div>

                      {/* 페이지네이션 영역 (항상 하단 고정) */}
                      {bookmarkPageResult.totalPages > 1 && (
                        <div className="py-3 px-4 flex justify-center">
                          <Pagination
                            pageResult={bookmarkPageResult}
                            handlePageClick={handleBookmarkPageClick}
                            loading={false}
                            visibleCount={5}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽 선택 요약 */}
        <div className="p-5  border-b border-gray-200 ">
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

      {/* ✅ TravelFilterModal 추가 */}
      <TravelFilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={({ category, regionQuery }) => {
          if (category) setCategoryFilter(category);
          if (regionQuery) setRegionFilterQuery(regionQuery);
          setFilterOpen(false);
        }}
      />
    </>
  );
}
