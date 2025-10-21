import axios from "axios";
import dayjs from "dayjs";
import useTownshipData from "../../../common/hooks/useTownshipData";
import MainLayout from "@/users/layout/MainLayout";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Radio, Input, DatePicker, Select, Button, Card, message, InputNumber,
  Pagination
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSearchState, setSelectedAcc } from "../../../common/slice/accSlice";
import { API_SERVER_HOST } from "../../../common/api/naviApi";

const { Meta } = Card;
const { RangePicker } = DatePicker;

const AccListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { townshipList, isLoading: isTownshipLoading, error: townshipError } =
    useTownshipData();

  // ✅ Redux에서 기존 검색 상태 불러오기
  const savedSearch = useSelector((state) => state.acc.searchState) || {};

  /* ✅ 첫 진입 시 localStorage → Redux 복원 */
  useEffect(() => {
    const storedState = localStorage.getItem("searchState");
    if (storedState) {
      try {
        const parsed = JSON.parse(storedState);
        dispatch(setSearchState(parsed));

        // ✅ local state 복원
        setSearchType(parsed.searchType || "region");
        setCity(parsed.city || null);
        setTownship(parsed.township || null);
        setKeyword(parsed.keyword || "");
        setSpot(parsed.spot || "");
        setGuestCount(parsed.guestCount || null);
        setRoomCount(parsed.roomCount || null);

        if (parsed.dateRange?.length === 2) {
          setDateRange([dayjs(parsed.dateRange[0]), dayjs(parsed.dateRange[1])]);
        }

        if (parsed.accommodations?.length > 0) {
          setAccommodations(parsed.accommodations);
          setIsSearched(true);
        }
      } catch (e) {
        console.warn("searchState 복원 실패:", e);
      }
    }
  }, [dispatch]);

  /* ✅ 검색 상태 */
  const [searchType, setSearchType] = useState(savedSearch.searchType || "region");
  const [city, setCity] = useState(savedSearch.city);
  const [township, setTownship] = useState(savedSearch.township);
  const [keyword, setKeyword] = useState(savedSearch.keyword);
  const [spot, setSpot] = useState(savedSearch.spot);
  const [guestCount, setGuestCount] = useState(savedSearch.guestCount);
  const [roomCount, setRoomCount] = useState(savedSearch.roomCount);
  const [isSearched, setIsSearched] = useState(savedSearch.isSearched || false);
  const [accommodations, setAccommodations] = useState(savedSearch.accommodations || []);

  const [dateRange, setDateRange] = useState(
    savedSearch.dateRange && savedSearch.dateRange.length === 2
      ? [dayjs(savedSearch.dateRange[0]), dayjs(savedSearch.dateRange[1])]
      : null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  /* ✅ 시·읍면 옵션 구성 */
  const cityOptions = useMemo(() => {
    return [...new Set(townshipList.map((t) => t.sigunguName))].map((city) => ({
      value: city,
      label: city,
    }));
  }, [townshipList]);

  const townshipOptions = useMemo(() => {
    return city
      ? townshipList
        .filter((t) => t.sigunguName === city)
        .map((t) => ({ value: t.townshipName, label: t.townshipName }))
      : [];
  }, [city, townshipList]);

  /* ✅ 검색 실행 */
  const handleSearch = useCallback(async () => {
    if (isTownshipLoading) {
      message.warning("읍면동 데이터를 로딩 중입니다. 잠시만 기다려주세요.");
      return;
    }
    if (townshipError) {
      message.error("읍면동 데이터 로드에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    if (!dateRange || dateRange.length !== 2) {
      message.warning("체크인 및 체크아웃 날짜를 모두 선택해주세요.");
      return;
    }
    if (!guestCount || guestCount <= 0) {
      message.warning("투숙 인원을 입력해주세요.");
      return;
    }
    if (!roomCount || roomCount <= 0) {
      message.warning("객실 수를 입력해주세요.");
      return;
    }

    if (searchType === "region") {
      if (!city) {
        message.warning("행정시를 선택해주세요.");
        return;
      }
      if (!township) {
        message.warning("읍면을 선택해주세요.");
        return;
      }
    } else if (searchType === "keyword") {
      if (!keyword?.trim()) {
        message.warning("숙소명을 입력해주세요.");
        return;
      }
    } else if (searchType === "spot") {
      if (!spot?.trim()) {
        message.warning("관광명소를 입력해주세요.");
        return;
      }
    }

    try {
      const params = {};

      if (searchType === "region") params.townshipName = township;
      else if (searchType === "keyword") params.title = keyword.trim();
      else if (searchType === "spot") params.spot = spot.trim();

      const dateRangeArray = dateRange.map((d) => d.format("YYYY-MM-DD"));
      params.checkIn = dateRangeArray[0];
      params.checkOut = dateRangeArray[1];
      params.guestCount = guestCount;
      params.roomCount = roomCount;

      const res = await axios.get("/api/accommodations", { params });
      console.log("📦 [axios response]", res);

      const resultData = res.data;

      setAccommodations(resultData);
      setIsSearched(true);
      setCurrentPage(1);

      const newSearchState = {
        searchType,
        city,
        township,
        keyword,
        spot,
        guestCount,
        roomCount,
        dateRange: dateRangeArray,
        isSearched: true,
        accommodations: resultData,
      };

      dispatch(setSearchState(newSearchState));
      localStorage.setItem("searchState", JSON.stringify(newSearchState));

      if (resultData.length === 0) message.info("검색 결과가 없습니다 😢");
    } catch (err) {
      console.error("숙소 검색 실패:", err);
      message.error("숙소 목록을 불러오지 못했습니다.");
    }
  }, [
    searchType,
    city,
    township,
    keyword,
    spot,
    dateRange,
    guestCount,
    roomCount,
    isTownshipLoading,
    townshipError,
    dispatch,
  ]);

  /* ✅ 숙소 카드 클릭 시 */
  const handleCardClick = useCallback(
    async (acc) => {
      try {
        // 조회수 증가 요청
        const patchRes = await fetch(`${API_SERVER_HOST}/api/accommodations/view/${acc.accId}`, {
          method: "PATCH",
        });
        if (!patchRes.ok) throw new Error("조회수 증가 실패");

        // 최신 DB 값으로 재조회
        const detailRes = await axios.get(`${API_SERVER_HOST}/api/accommodations/${acc.accId}`);
        const updatedAcc = detailRes.data;

        // accommodations 배열에서 해당 acc만 최신 값으로 교체
        setAccommodations((prev) => {
          const updated = prev.map((item) =>
            item.accId === updatedAcc.accId ? { ...item, viewCount: updatedAcc.viewCount } : item
          );

          // 수정된 목록을 localStorage에도 반영
          const newState = { ...savedSearch, accommodations: updated, isSearched: true };
          localStorage.setItem("searchState", JSON.stringify(newState));

          return updated;
        });

        // Redux 저장 및 상세 페이지 이동
        dispatch(setSelectedAcc(updatedAcc.accId));
        localStorage.setItem("selectedAccId", updatedAcc.accId);
        navigate("/accommodations/detail");
      } catch (err) {
        console.error("🚨 조회수 증가 또는 재조회 실패:", err);
        message.error("조회수 반영 중 오류가 발생했습니다.");
      }
    },
    [dispatch, navigate, savedSearch]
  );

  /* ✅ 페이지네이션 */
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = accommodations.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ✅ 렌더링 */
  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center pt-10 pb-12 px-8">
        <div className="w-full max-w-7xl">
          {/* 검색 폼 */}
          <div className="bg-white/70 shadow-md rounded-2xl p-8 mb-8">
            <h1 className="text-2xl font-bold mb-2">숙소를 찾아보세요 🏖️</h1>
            <p className="text-gray-600 mb-6">여행 스타일에 맞게 검색해보세요!</p>

            <Radio.Group
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="mb-6"
              size="large"
            >
              <Radio.Button value="region">지역별 찾기</Radio.Button>
              <Radio.Button value="spot">명소 주변 찾기</Radio.Button>
              <Radio.Button value="keyword">숙소명 검색</Radio.Button>
            </Radio.Group>

            <div className="flex flex-wrap gap-2 items-center justify-start">
              {searchType === "region" && (
                <>
                  <Select
                    placeholder="행정시 선택"
                    className="min-w-[150px]"
                    value={city || undefined}
                    onChange={(c) => {
                      setCity(c);
                      setTownship("");
                    }}
                    options={cityOptions}
                    size="large"
                  />
                  <Select
                    placeholder="읍면 선택"
                    className="min-w-[150px]"
                    value={township || undefined}
                    onChange={setTownship}
                    options={townshipOptions}
                    disabled={!city}
                    size="large"
                  />
                </>
              )}

              {searchType === "spot" && (
                <Input
                  placeholder="관광명소를 입력하세요"
                  className="min-w-[300px] w-[400px] flex-shrink-0"
                  size="large"
                  value={spot}
                  onChange={(e) => setSpot(e.target.value)}
                />
              )}

              {searchType === "keyword" && (
                <Input
                  placeholder="숙소명을 입력하세요"
                  className="min-w-[300px] w-[400px] flex-shrink-0"
                  size="large"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              )}

              <RangePicker
                format="YYYY-MM-DD"
                placeholder={["체크인", "체크아웃"]}
                value={dateRange}
                size="large"
                onChange={(v) => setDateRange(v)}
                disabledDate={(current) => {
                  // ✅ 오늘 이전 날짜 비활성화
                  const today = dayjs().startOf("day");
                  return current && current < today;
                }}
                onCalendarChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    const diff = dayjs(dates[1]).diff(dayjs(dates[0]), "day");
                    if (diff > 7) {
                      message.warning("최대 7박까지만 예약할 수 있습니다.");
                      setDateRange(null);
                    }
                  }
                }}
              />

              <InputNumber
                min={1}
                max={30}
                value={guestCount}
                onChange={(v) => setGuestCount(v)}
                className="min-w-[80px]"
                placeholder="인원수"
                size="large"
              />
              <InputNumber
                min={1}
                max={30}
                value={roomCount}
                onChange={(v) => setRoomCount(v)}
                className="min-w-[80px]"
                placeholder="객실수"
                size="large"
              />

              <div className="ml-auto flex-shrink-0">
                <Button
                  type="primary"
                  className="h-10 px-8 text-base font-semibold"
                  onClick={handleSearch}
                  size="large"
                >
                  검색
                </Button>
              </div>
            </div>
          </div>

          {/* 검색 결과 */}
          <div className="bg-white shadow-md rounded-2xl p-8 mb-10">
            <h2 className="text-2xl font-bold mb-6">검색 결과</h2>

            {!isSearched ? (
              <div className="text-center text-gray-500 min-h-[300px] flex items-center justify-center border border-dashed border-gray-300 rounded-lg p-4">
                <p className="text-lg">
                  원하는 숙소를 찾아보세요! 🚀
                  <br />
                  상단의 검색 조건을 입력하고 ‘검색’을 눌러주세요.
                </p>
              </div>
            ) : accommodations.length === 0 ? (
              <div className="text-center text-gray-400 py-20">검색 결과가 없습니다 😢</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {currentData.map((acc) => (
                    <Card
                      key={acc.accId}
                      hoverable
                      className="rounded-xl shadow-sm cursor-pointer transition-transform transform hover:scale-[1.02] duration-200"
                      onClick={() => handleCardClick(acc)}
                      cover={
                        acc.accImage ? (
                          <img
                            alt={acc.title}
                            src={
                              acc.accImage.startsWith("/images/")
                                ? `${API_SERVER_HOST}${acc.accImage}`
                                : `${API_SERVER_HOST}/images/acc/${acc.accImage}`
                            }
                            className="h-60 object-cover w-full rounded-t-xl"
                            onError={(e) => {
                              e.target.style.display = "none";
                              const fallback = document.createElement("div");
                              fallback.className =
                                "h-60 w-full flex items-center justify-center rounded-t-xl bg-gray-200/60 text-gray-600 font-medium text-lg";
                              fallback.textContent = "이미지 준비중";
                              e.target.parentNode.appendChild(fallback);
                            }}
                          />
                        ) : (
                          <div className="h-60 w-full flex items-center justify-center rounded-t-xl bg-gray-200/60 text-gray-600 font-medium text-lg">
                            이미지 준비중
                          </div>
                        )
                      }
                    >
                      <Meta
                        title={<span className="text-lg font-bold">{acc.title}</span>}
                        description={
                          <div className="text-gray-600 mt-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700">
                                {acc.minPrice ? `${acc.minPrice.toLocaleString()}원` : "가격 미정"} / 1박
                              </span>

                              {/* ✅ 값이 없을 때 기본값 0 표시 */}
                              <span className="flex items-center text-gray-500 text-sm">
                                <EyeOutlined className="text-gray-400 mr-1" />
                                {(acc.viewCount ?? 0).toLocaleString()}회
                              </span>
                            </div>

                            <p className="text-gray-500 text-sm truncate">{acc.address}</p>
                          </div>
                        }
                      />
                    </Card>
                  ))}
                </div>

                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={accommodations.length}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  className="mt-8 text-center"
                />
              </>
            )}
          </div>
        </div>
      </div >
    </MainLayout >
  );
};

export default AccListPage;
