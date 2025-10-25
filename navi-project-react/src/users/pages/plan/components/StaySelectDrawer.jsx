import React, { useEffect, useMemo, useRef, useState } from "react";
import { List, Button, Empty, Input, Tabs, message, Modal } from "antd";
import TitleDateDisplay from "./TitleDateDisplay";
import Pagination from "@/common/components/travel/Pagination";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import api from "@/common/api/naviApi";
import axios from "axios";

const { Search } = Input;

export default function StaySelectDrawer({
  stays = [],
  title = "",
  dateRange = [],
  days = [],
  hasNights = false,
  stayPlans = {},
  setStayPlans = () => { },
  selectedStays = [],
  setSelectedStays = () => { },
  setSelectedStayTarget = () => { },
  setShowStayModal = () => { },
  resetAllStays = () => { },
}) {
  const [activeTab, setActiveTab] = useState("search");
  const [searchText, setSearchText] = useState("");
  const [sortType, setSortType] = useState("latest");
  const [myBookmarks, setMyBookmarks] = useState([]);
  const [imageMap, setImageMap] = useState({});

  const FALLBACK_IMG = `${API_SERVER_HOST}/images/common/default_acc.jpg`;

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

  const listContainerRef = useRef(null);

  /** ✅ 숙소 이미지 로드 */
  useEffect(() => {
    const fetchImages = async () => {
      if (!stays || stays.length === 0) return;
      const results = {};
      await Promise.all(
        stays.map(async (item) => {
          try {
            const res = await axios.get(`${API_SERVER_HOST}/api/images`, {
              params: { targetType: "ACC", targetId: item.accId },
            });
            const list = res.data?.data || [];
            if (list.length > 0) {
              const path = list[0].path.startsWith("/images/")
                ? `${API_SERVER_HOST}${list[0].path}`
                : `${API_SERVER_HOST}/images/acc/${list[0].path}`;
              results[item.accId] = path;
              item.accImage = path;
            }
          } catch (err) {
            console.warn(`❌ 이미지 로드 실패: ${item.accId}`);
          }
        })
      );
      setImageMap(results);
    };
    fetchImages();
  }, [stays]);

  /** ✅ 나의 숙소 북마크 불러오기 */
  useEffect(() => {
    if (activeTab !== "my") return;
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          message.warning("로그인 후 이용 가능합니다.");
          return;
        }
        const res = await api.get("/stay/bookmarks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        setMyBookmarks(data);
      } catch (err) {
        console.error("❌ 북마크 숙소 불러오기 실패:", err);
      }
    };
    fetchBookmarks();
  }, [activeTab]);

  /** ✅ 검색 + 정렬 */
  const filteredStays = useMemo(() => {
    let list = [...stays];
    const keyword = searchText.trim().toLowerCase();

    if (keyword) {
      list = list.filter(
        (s) =>
          s.title?.toLowerCase().includes(keyword) ||
          s.address?.toLowerCase().includes(keyword)
      );
    }

    switch (sortType) {
      case "likes":
        return list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      case "views":
        return list.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      default:
        return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }
  }, [stays, searchText, sortType]);

  /** ✅ 페이지 계산 */
  useEffect(() => {
    const totalElements = filteredStays.length;
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
  }, [filteredStays, currentPage, pageSize]);

  /** ✅ 페이지 데이터 */
  const pagedStays = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredStays.slice(startIdx, startIdx + pageSize);
  }, [filteredStays, currentPage, pageSize]);

  /** ✅ 페이지 클릭 */
  const handlePageClick = (page) => {
    if (page >= 1 && page <= pageResult.totalPages) {
      setCurrentPage(page);
      if (listContainerRef.current) {
        listContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  /** ✅ 숙소 선택 toggle */
  const handleToggleSelect = (item) => {
    if (!hasNights)
      return message.info("1일 여행은 숙소 설정이 필요하지 않습니다.");
    setSelectedStayTarget(item);
    setShowStayModal(true);
  };

  /** ✅ 숙소 카드 */
  const renderStayItem = (item) => {
    const imgSrc =
      item.accImage?.trim() ||
      item.imagePath?.trim() ||
      `${API_SERVER_HOST}/images/acc/default_hotel.jpg`;

    const assigned = Object.keys(stayPlans).includes(item.accId);
    return (
      <List.Item
        key={item.accId}
        onClick={() => handleToggleSelect(item)}
        className={`cursor-pointer ${!hasNights ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div
          className={`flex justify-between w-full items-center bg-white px-4 py-3 rounded-lg shadow-sm transition-all hover:shadow-md ${assigned
            ? "ring-2 ring-[#0A3D91] ring-offset-1"
            : "border border-gray-200"
            }`}
        >
          <div className="flex items-center gap-3">
            <img
              src={imgSrc}
              alt={item.title}
              className="w-16 h-16 rounded-md object-cover"
              onError={(e) => (e.target.src = FALLBACK_IMG)}
            />
            <div>
              <p className="font-semibold text-sm text-[#2F3E46] mb-0">
                {item.title}
              </p>
              <p className="text-xs text-gray-500">
                {item.address || "주소 정보 없음"}
              </p>
            </div>
          </div>
          {assigned ? (
            <i className="bi bi-check-circle-fill text-[#6846FF] text-xl"></i>
          ) : (
            <i className="bi bi-calendar-plus text-[#2F3E46] text-xl"></i>
          )}
        </div>
      </List.Item>
    );
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      {/* 왼쪽: 숙소 검색 / 나의 숙소 */}
      <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-hidden">
        <TitleDateDisplay title={title} dateRange={dateRange} />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="px-4 pt-3 flex-shrink-0"
          items={[
            { key: "search", label: "숙소 검색" },
            { key: "my", label: "나의 숙소" },
          ]}
        />

        {/* ✅ 왼쪽 콘텐츠 스크롤 */}
        <div ref={listContainerRef} className="flex-1 overflow-y-auto custom-scroll">
          {activeTab === "search" && (
            <div className="flex flex-col gap-3 px-4 mt-1 mb-2">
              <Search
                placeholder="숙소명을 입력하세요"
                allowClear
                enterButton
                onSearch={(val) => setSearchText(val)}
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
              />

              {/* 정렬 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  총{" "}
                  <span className="font-semibold text-[#0A3D91]">
                    {filteredStays.length}
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

              {/* ✅ 숙소 리스트 */}
              <div className="pb-4">
                <List
                  dataSource={pagedStays}
                  locale={{
                    emptyText: <Empty description="검색 결과가 없습니다." />,
                  }}
                  renderItem={renderStayItem}
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

          {/* ✅ 나의 숙소 탭 */}
          {activeTab === "my" && (
            <div className="px-4 pb-4">
              <List
                dataSource={myBookmarks}
                locale={{
                  emptyText: <Empty description="북마크한 숙소가 없습니다." />,
                }}
                renderItem={renderStayItem}
              />
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽: 숙소 일정 요약 */}
      <div className="w-1/2 bg-[#FDFCF9] flex flex-col overflow-hidden">
        <div className="p-5 flex-shrink-0 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-[#2F3E46]">
                🏨 숙박 일정 요약
              </h3>
              <p className="text-sm text-gray-500">
                총 {Math.max((days?.length || 1) - 1, 0)}박 /{" "}
                {
                  Object.keys(stayPlans).filter(
                    (k) => (stayPlans?.[k]?.length ?? 0) > 0
                  ).length
                }개 숙소
              </p>
            </div>
            <Button
              type="text"
              className="text-red-500 hover:text-red-600 font-semibold"
              onClick={resetAllStays}
            >
              초기화
            </Button>
          </div>
        </div>

        {/* ✅ 숙소 요약 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto custom-scroll p-5">
          {(selectedStays?.length ?? 0) > 0 || hasNights ? (
            <div className="space-y-6">
              {(days || [])
                .slice(0, (days?.length || 1) - 1)
                .map((d, idx) => {
                  const nextDay = days[idx + 1];
                  const rangeText = `${d.format("MM.DD(ddd)")} ~ ${nextDay.format("MM.DD(ddd)")}`;
                  const dateStr = d.format("MM/DD");

                  const assigned = Object.entries(stayPlans).find(([_, dates]) =>
                    dates.includes(dateStr)
                  );
                  const assignedStayId = assigned ? assigned[0] : null;
                  const stayData = stays.find((s) => s.accId === assignedStayId);

                  const displayStay = stayData || {
                    accId: `default-${idx}`,
                    title: "숙소 미정",
                    address: "좌측에서 숙소 선택",
                  };

                  return (
                    <div
                      key={d.format("YYYY-MM-DD")}
                      className="border border-gray-200 rounded-xl p-4 bg-[#FAFAFA]"
                    >
                      <div className="text-sm font-semibold text-[#2F3E46] mb-3">
                        {rangeText}
                      </div>
                      <div
                        className="flex items-center justify-between bg-white border rounded-lg p-3 hover:shadow-sm cursor-pointer transition"
                        onClick={() => {
                          if (displayStay.title === "숙소 미정") {
                            message.info("좌측 목록에서 숙소를 선택해주세요.");
                            return;
                          }

                          const assignedStayId = Object.entries(stayPlans).find(
                            ([_, dates]) => dates.includes(dateStr)
                          )?.[0];

                          if (assignedStayId) {
                            Modal.confirm({
                              title: "숙소 일정 해제",
                              content: "이 날짜의 숙소 일정을 취소하시겠습니까?",
                              okText: "해제",
                              cancelText: "취소",
                              centered: true,
                              onOk: () => {
                                const updated = { ...stayPlans };
                                updated[assignedStayId] = updated[
                                  assignedStayId
                                ].filter((d) => d !== dateStr);
                                if (updated[assignedStayId].length === 0)
                                  delete updated[assignedStayId];
                                setStayPlans(updated);
                                const active = Object.keys(updated).filter(
                                  (k) => updated[k].length
                                );
                                setSelectedStays(
                                  stays.filter((s) => active.includes(s.accId))
                                );
                                message.success("숙소 일정이 해제되었습니다.");
                              },
                            });
                            return;
                          }

                          setSelectedStayTarget(stayData);
                          setShowStayModal(true);
                        }}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-7 h-7 rounded-full bg-[#EAEAEA] text-center text-xs font-semibold text-gray-700 leading-[28px]">
                            {idx + 1}
                          </div>
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={displayStay.accImage || FALLBACK_IMG}
                              alt={displayStay.title}
                              className="w-full h-full object-cover"
                              onError={(e) => (e.target.src = FALLBACK_IMG)}
                            />
                          </div>
                          <div className="flex flex-col ml-3 min-w-[140px]">
                            <p
                              className={`text-sm font-semibold ${displayStay.title === "숙소 미정"
                                ? "text-gray-500 italic"
                                : "text-[#2F3E46]"
                                }`}
                            >
                              {displayStay.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {displayStay.address}
                            </p>
                          </div>
                        </div>
                        {displayStay.title !== "숙소 미정" && (
                          <i className="bi bi-pencil-square text-xl text-[#2F3E46]"></i>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <Empty description="좌측 목록에서 숙소를 선택하여 일정을 설정하세요." />
          )}
        </div>
      </div>
    </div>
  );
}
