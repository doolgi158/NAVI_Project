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
  const [myBookmarks, setMyBookmarks] = useState([]);
  const [imageMap, setImageMap] = useState({});

  const FALLBACK_IMG = `https://placehold.co/150x150?text=No+Image`;;

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

  /** ✅ 검색 + 정렬 */
  const filteredStays = useMemo(() => {
    let list = [...stays];
    const keyword = searchText.trim().toLowerCase();

    if (keyword) {
      // ✅ 검색어의 공백 제거 + 소문자 처리
      const normalizedKeyword = keyword.replace(/\s+/g, "").toLowerCase();

      list = list.filter((s) => {
        // ✅ 숙소명 + 주소의 공백 제거 후 비교
        const normalizedText = `${s.title || ""} ${s.address || ""}`
          .replace(/\s+/g, "")
          .toLowerCase();

        // ✅ 부분일치 허용
        return normalizedText.includes(normalizedKeyword);
      });
    }

    return list;
  }, [stays, searchText]);

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


  /** ✅ 숙소 이미지 로드 */
  useEffect(() => {
    // ReferenceError를 방지하기 위해 pagedStays 대신 activeTab과 관련된 목록을 명시적으로 사용합니다.
    const staysToFetch = activeTab === "search" ? pagedStays : myBookmarks;

    const fetchImages = async () => {
      // staysToFetch가 비어있거나, pagedStays가 아직 초기화되지 않았다면 (pagedStays가 useMemo로 계산되기 전의 초기 렌더링)
      // 실행을 막고 안정성을 확보합니다. (다만 pagedStays는 useMemo이므로 정의는 되어 있습니다.)
      if (!staysToFetch || staysToFetch.length === 0) return;

      // 이미 accImage가 설정된 숙소는 건너뛰기 위해 필터링합니다.
      const itemsToFetch = staysToFetch.filter(item => !item.accImage);

      if (itemsToFetch.length === 0) return;

      const results = {};
      await Promise.all(
        itemsToFetch.map(async (item) => {
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
              // 리스트의 원본 객체에도 이미지 경로를 저장하여 중복 호출을 막습니다.
              // 주의: props인 stays는 변경하지 않습니다. pagedStays/myBookmarks는 filteredStays/myBookmarks의 복사본이거나 파생된 목록이므로 괜찮습니다.
              item.accImage = path;
            }
          } catch (err) {
            // console.warn(`❌ 이미지 로드 실패: ${item.accId}`);
          }
        })
      );
      // 기존 이미지 맵에 새로운 결과를 병합합니다.
      setImageMap(prevMap => ({ ...prevMap, ...results }));
    };

    // pagedStays와 myBookmarks는 useMemo나 useState로 정의되어 있기 때문에 
    // 여기서 staysToFetch에 접근해도 ReferenceError는 발생하지 않습니다.
    // 하지만, React는 렌더링 과정에서 useMemo가 정의되는 순서와 useEffect가 실행되는 순서를 최적화할 수 있습니다.
    // 이를 피하기 위해 pagedStays 자체를 의존성 배열에 넣는 대신, 
    // pagedStays의 변화를 일으키는 `currentPage`와 `filteredStays`의 변화를 일으키는 `searchText`를 
    // 의존성 배열에 넣어서 로직이 실행되도록 합니다. 
    // 이렇게 하면 pagedStays의 계산이 완료된 후 useEffect가 실행됩니다.
    // 또한 myBookmarks는 activeTab="my"에서만 로드하므로 activeTab을 유지합니다.
    if (activeTab === "search") {
      fetchImages();
    } else if (activeTab === "my" && myBookmarks.length > 0) {
      fetchImages();
    }
    // 의존성 배열을 재조정합니다.
  }, [activeTab, currentPage, searchText, myBookmarks]);
  // pagedStays를 의존성에 넣으면 에러가 발생하므로, pagedStays의 '소스'가 되는 변수를 넣습니다.


  // /** ✅ 나의 숙소 북마크 불러오기 */
  // useEffect(() => {
  //   if (activeTab !== "my") return;
  //   const fetchBookmarks = async () => {
  //     try {
  //       const token = localStorage.getItem("accessToken");
  //       if (!token) {
  //         message.warning("로그인 후 이용 가능합니다.");
  //         return;
  //       }
  //       const res = await api.get("/stay/bookmarks", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       const data = Array.isArray(res.data)
  //         ? res.data
  //         : Array.isArray(res.data?.data)
  //           ? res.data.data
  //           : [];
  //       setMyBookmarks(data);
  //     } catch (err) {
  //       console.error("❌ 북마크 숙소 불러오기 실패:", err);
  //     }
  //   };
  //   fetchBookmarks();
  // }, [activeTab]);


  /** ✅ 페이지 클릭 */
  const handlePageClick = (page) => {
    if (page >= 1 && page <= pageResult.totalPages) {
      setCurrentPage(page);
      if (listContainerRef.current) {
        listContainerRef.current.scrollTo({ top: 0, behavior: "auto" });
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
      FALLBACK_IMG;

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
            {/* ✅ 둥근 이미지 썸네일 */}
            <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm ring-1 ring-gray-200">
              <img
                src={imgSrc}
                alt={item.title}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => (e.target.src = FALLBACK_IMG)}
              />
            </div>

            {/* ✅ 텍스트 정보 */}
            <div className="flex flex-col justify-center min-w-[140px]">
              <p className="font-semibold text-sm text-[#2F3E46] mb-0 truncate max-w-[140px]" title={item.title}>
                {item.title}
              </p>
              <p className="text-xs text-gray-500 line-clamp-1 truncate max-w-[140px]" title={item.address}>
                {item.address || "주소 정보 없음"}
              </p>
            </div>
          </div>

          {/* ✅ 선택 아이콘 */}
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
      <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-hidden  w-[360px]">
        <TitleDateDisplay title={title} dateRange={dateRange} />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="px-4 pt-3 flex-shrink-0"
          items={[
            { key: "search", label: "숙소 검색" },
            // { key: "my", label: "나의 숙소" },
          ]}
        />

        {/* ✅ 왼쪽 콘텐츠 스크롤 */}
        <div className="flex-1 overflow-y-auto custom-scroll">
          {activeTab === "search" && (
            <div className="flex flex-col h-full">
              {/* ✅ 상단 검색 + 정렬 영역 sticky 고정 */}
              <div className="sticky top-0 z-10 bg-white px-4 pt-2 pb-3 border-b border-gray-200">
                <Search
                  placeholder="숙소명을 입력하세요"
                  allowClear
                  enterButton
                  onSearch={(val) => setSearchText(val)}
                  onChange={(e) => setSearchText(e.target.value)}
                  value={searchText}
                />

                {/* 총 개수 */}
                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-gray-600">
                    총{" "}
                    <span className="font-semibold text-[#0A3D91]">
                      {filteredStays.length.toLocaleString()}
                    </span>{" "}
                    개
                  </span>
                </div>
              </div>

              {/* ✅ 숙소 리스트는 스크롤 가능 */}
              <div ref={listContainerRef} className="flex-1 overflow-y-auto px-4 pb-4 custom-scroll">
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
          ✅ 나의 숙소 탭
          {activeTab === "my" && (
            <div className="px-4 pb-4 ">
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
        <div className="flex-1 overflow-y-auto custom-scroll p-5  w-[400px]">
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
                      className="border border-gray-200 rounded-xl p-4 bg-[#FAFAFA] "
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
                                updated[assignedStayId] = updated[assignedStayId].filter(
                                  (d) => d !== dateStr
                                );
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
                        <div className="flex items-center gap-4 flex-1 overflow-hidden">
                          <div className="w-7 h-7 rounded-full bg-[#EAEAEA] text-center text-xs font-semibold text-gray-700 leading-[28px]">
                            {idx + 1}
                          </div>

                          {/* ✅ 이미지 영역 고정폭 */}
                          <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md ring-1 ring-gray-200">
                            <img
                              src={
                                displayStay.accImage?.trim()
                                  ? displayStay.accImage.startsWith("http")
                                    ? displayStay.accImage
                                    : `${API_SERVER_HOST}${displayStay.accImage}`
                                  : FALLBACK_IMG
                              }
                              alt={displayStay.title}
                              className="w-full h-full object-cover rounded-xl"
                              onError={(e) => (e.target.src = FALLBACK_IMG)}
                            />
                          </div>

                          {/* ✅ 텍스트 컨테이너 (오버플로 방지 핵심) */}
                          <div className="flex flex-col ml-3 flex-1 min-w-0 overflow-hidden">
                            <p
                              className={`text-sm font-semibold truncate ${displayStay.title === "숙소 미정"
                                ? "text-gray-500 italic"
                                : "text-[#2F3E46]"
                                }`}
                              title={displayStay.title}
                            >
                              {displayStay.title}
                            </p>
                            <p
                              className="text-xs text-gray-500 truncate"
                              title={displayStay.address}
                            >
                              {displayStay.address}
                            </p>
                          </div>
                        </div>

                        {displayStay.title !== "숙소 미정" && (
                          <i className="bi bi-dash-square text-xl text-[#dc2626] ml-3"></i>
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