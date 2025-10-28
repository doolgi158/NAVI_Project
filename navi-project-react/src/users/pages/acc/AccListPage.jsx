import { useState, useMemo, useCallback, useEffect } from "react";
import { Radio, Input, DatePicker, Select, Typography, Button, Card, message, InputNumber, Pagination, Checkbox, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSearchState, setSelectedAcc } from "../../../common/slice/accSlice";
import { API_SERVER_HOST } from "../../../common/api/naviApi";
import useTownshipData from "../../../common/hooks/useTownshipData";
import MainLayout from "@/users/layout/MainLayout";
import axios from "axios";
import dayjs from "dayjs";

const { Text } = Typography;
const { Meta } = Card;
const { RangePicker } = DatePicker;


const AccListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const savedSearch = useSelector((state) => state.acc.searchState) || {};
  const { townshipList, isLoading: isTownshipLoading, error: townshipError } = useTownshipData();

  useEffect(() => {
    const isFirstVisit = !sessionStorage.getItem("visited_acc_list");
    if (isFirstVisit) {
      sessionStorage.setItem("visited_acc_list", "true");
      dispatch(setSearchState({}));
      localStorage.removeItem("searchState");
    }
  }, [dispatch]);

  useEffect(() => {
    const storedState = localStorage.getItem("searchState");
    if (storedState) {
      try {
        const parsed = JSON.parse(storedState);
        dispatch(setSearchState(parsed));

        setSearchType(parsed.searchType || "region");
        setCity(parsed.city || null);
        setTownship(parsed.township || null);
        setKeyword(parsed.keyword || "");
        setSpot(parsed.spot || "");
        setGuestCount(parsed.guestCount || null);
        setRoomCount(parsed.roomCount || null);

        if (parsed.dateRange?.length === 2) {
          setDateRange([
            dayjs(parsed.dateRange[0]),
            dayjs(parsed.dateRange[1]),
          ]);
        }

        // ✅ 검색 조건 복원 후 자동 재검색
        if (parsed.isSearched) {
          handleSearch(currentPage, pageSize);
        }

      } catch (e) {
        console.warn("searchState 복원 실패:", e);
      }
    }
  }, [dispatch]);


  const [searchType, setSearchType] = useState(savedSearch.searchType || "region");
  const [city, setCity] = useState(savedSearch.city);
  const [township, setTownship] = useState(savedSearch.township);
  const [keyword, setKeyword] = useState(savedSearch.keyword);
  const [spot, setSpot] = useState(savedSearch.spot);
  const [guestCount, setGuestCount] = useState(savedSearch.guestCount || 1);
const [roomCount, setRoomCount] = useState(savedSearch.roomCount || 1);
  const [isSearched, setIsSearched] = useState(savedSearch.isSearched || false);
  const [accommodations, setAccommodations] = useState(savedSearch.accommodations || []);
  const [sortOption, setSortOption] = useState("title");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dateRange, setDateRange] = useState(
    savedSearch.dateRange && savedSearch.dateRange.length === 2
      ? [dayjs(savedSearch.dateRange[0]), dayjs(savedSearch.dateRange[1])]
      : null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

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

  const handleSearch = useCallback(
    async (page = 1, size = pageSize) => {
      if (isTownshipLoading) return;
      if (townshipError) {
        message.error("잠시 후에 다시 시도해주세요.");
        return;
      }

      const missingFields = [];
      if (!dateRange || dateRange.length !== 2) missingFields.push("체크인/체크아웃 날짜");
      if (!guestCount || guestCount <= 0) missingFields.push("투숙 인원");
      if (!roomCount || roomCount <= 0) missingFields.push("객실 수");

      if (searchType === "region") {
        if (!city) missingFields.push("행정시");
        if (!township) missingFields.push("읍면");
      } else if (searchType === "keyword" && !keyword?.trim()) {
        missingFields.push("숙소명");
      }

      if (missingFields.length > 0) {
        message.warning(`${missingFields.join(", ")} 입력해주세요.`);
        return;
      }

      try {
        setLoading(true);   // 로딩 시작
        const params = {
          city,
          townshipName: township,
          title: keyword?.trim(),
          spot: spot?.trim(),
          checkIn: dateRange[0].format("YYYY-MM-DD"),
          checkOut: dateRange[1].format("YYYY-MM-DD"),
          guestCount,
          roomCount,
          categoryList: selectedCategories,
          sort: sortOption,
          page,
          size,
        };
        console.log(params);
        const res = await axios.get(`${API_SERVER_HOST}/api/accommodations`, { params });
        const { data = [], total = 0, page: current, size: pageSizeFromServer } = res.data;
        console.log(data);

        setAccommodations(data);
        setIsSearched(true);
        setCurrentPage(current);
        setPageSize(pageSizeFromServer);
        setTotalCount(total);

        const newSearchState = {
          searchType,
          city,
          township,
          keyword,
          guestCount,
          roomCount,
          dateRange: [params.checkIn, params.checkOut],
          isSearched: true,
          selectedCategories,
        };

        dispatch(setSearchState(newSearchState));
        localStorage.setItem("searchState", JSON.stringify(newSearchState));
      } catch (err) {
        console.error("숙소 검색 실패:", err);
        message.error("숙소 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);  // 로딩 종료
      }
    },
    [
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
      selectedCategories,
      sortOption,
      dispatch,
      pageSize,
    ]
  );

  const handleCardClick = useCallback(
    (acc) => {
      if (!acc?.accId) {
        message.error("숙소 정보가 올바르지 않습니다.");
        return;
      }
      dispatch(setSelectedAcc(acc));
      localStorage.setItem("selectedAccId", acc.accId);

      const condition = {
        searchType,
        city,
        township,
        keyword,
        spot,
        guestCount,
        roomCount,
        dateRange: dateRange ? dateRange.map((d) => d.format("YYYY-MM-DD")) : null,
      };
      dispatch(setSearchState(condition));
      localStorage.setItem("searchCondition", JSON.stringify(condition));

      navigate("/accommodations/detail");
    },
    [dispatch, navigate, searchType, city, township, keyword, spot, guestCount, roomCount, dateRange]
  );

  const handlePageChange = (page, size) => {
    handleSearch(page, size);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center pt-6 pb-8 px-6">
        <div className="w-full max-w-7xl">
          {/* 🔍 검색 섹션 */}
          <div className="bg-white/90 shadow-md rounded-2xl p-6 mb-6 border border-gray-100 backdrop-blur-sm">
            <h1 className="text-xl font-bold text-gray-800 mb-1">숙소를 찾아보세요 🏖️</h1>
            <p className="text-gray-500 text-sm mb-4">여행 스타일에 맞게 검색해보세요!</p>

            {/* 검색 타입 */}
            <Radio.Group
              value={searchType}
              onChange={(e) => {
                const type = e.target.value;
                setSearchType(type);
                if (type === "region") {
                  setKeyword("");
                  setSpot("");
                } else if (type === "keyword") {
                  setCity("");
                  setTownship("");
                  setSpot("");
                }
              }}
              size="middle"
              buttonStyle="solid"
              className="mb-5"
            >
              <Radio.Button value="region">지역별 찾기</Radio.Button>
              <Radio.Button value="keyword">숙소명 검색</Radio.Button>
            </Radio.Group>

            {/* 검색 폼 */}
            <div className="flex flex-wrap gap-2 items-end justify-start mb-5">
              {searchType === "region" ? (
                <>
                  <div className="flex flex-col">
                    <Text>지역</Text>
                    <Select
                      placeholder="행정시 선택"
                      className="w-[140px]"
                      value={city || undefined}
                      onChange={(c) => {
                        setCity(c);
                        setTownship("");
                      }}
                      options={cityOptions}
                      size="middle"
                    />
                  </div>
                  <Select
                    placeholder="읍면 선택"
                    className="w-[140px]"
                    value={township || undefined}
                    onChange={setTownship}
                    options={townshipOptions}
                    disabled={!city}
                    size="middle"
                  />
                </>
              ) : (
                <div className="flex flex-col">
                  <Text>숙소명</Text>
                  <Input
                    placeholder="숙소명을 입력하세요"
                    className="w-[320px]"
                    size="middle"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              )}
              <div className="flex flex-col">
                <Text>숙박 일정</Text>
                <RangePicker
                  format="YYYY-MM-DD"
                  placeholder={["체크인", "체크아웃"]}
                  value={dateRange}
                  size="middle"
                  onChange={(v) => setDateRange(v)}
                  disabledDate={(current) => {
                    const today = dayjs().startOf("day");
                    const twoWeeksLater = today.add(14, "day").endOf("day");
                    return current < today || current > twoWeeksLater;
                  }}
                />
              </div>
              <div className="flex flex-col">
                <Text>인원 수</Text>
                <InputNumber
                  min={1}
                  max={30}
                  value={guestCount}
                  onChange={setGuestCount}
                  placeholder="인원"
                  size="middle"
                  className="w-[90px]"
                />
              </div>
              <div className="flex flex-col">
                <Text>객실 수</Text>
                <InputNumber
                  min={1}
                  max={10}
                  value={roomCount}
                  onChange={setRoomCount}
                  placeholder="객실"
                  size="middle"
                  className="w-[90px]"
                />
              </div>
              <Button
                type="primary"
                className="!rounded-[6px] h-[32px] px-6 font-semibold border-0 bg-[#1677ff] text-white shadow-sm hover:shadow-md transition-all ml-auto"
                onClick={() => handleSearch(1, pageSize)}
                size="middle"
              >
                검색
              </Button>

            </div>

            {/* 정렬 & 필터 */}
            <div className="border-t border-gray-200 pt-3 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">정렬 기준:</span>
                <Select
                  value={sortOption}
                  onChange={(value) => setSortOption(value)}
                  style={{ width: 140 }}
                  options={[
                    { value: "title", label: "이름순" },
                    { value: "view", label: "조회순" },
                    { value: "minPrice", label: "낮은가격순" },
                    { value: "maxPrice", label: "높은가격순" },
                    { value: "recent", label: "최신등록순" },
                  ]}
                  size="middle"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-700">숙소 종류:</span>
                <Checkbox.Group
                  options={["호텔", "리조트/콘도", "모텔", "펜션", "게스트하우스/민박"]}
                  value={selectedCategories}
                  onChange={setSelectedCategories}
                />
              </div>
            </div>
          </div>

          {/* ✅ 검색 결과 */}
          <div className="bg-white/90 shadow-md rounded-2xl p-5 border border-gray-100 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-5">검색 결과</h2>
            
            <Spin spinning={loading} tip="숙소 정보를 불러오는 중입니다...">
              {!isSearched ? (
                <div className="text-center text-gray-500 min-h-[250px] flex items-center justify-center border border-dashed border-gray-300 rounded-2xl p-4">
                  <p className="text-base">
                    원하는 숙소를 찾아보세요! 🚀<br />검색 조건을 입력하고 ‘검색’을 눌러주세요.
                  </p>
                </div>
              ) : accommodations.length === 0 ? (
                <div className="text-center text-gray-400 py-16">검색 결과가 없습니다 😢</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {accommodations.map((acc, index) => (
                      <Card
                        key={acc.accId || `acc-${index}`}
                        hoverable
                        className="rounded-2xl shadow-sm cursor-pointer transition-transform transform hover:scale-[1.02] duration-200"
                        onClick={() => handleCardClick(acc)}
                        cover={
                          acc.mainImage ? (
                            <img
                              alt={acc.title}
                              src={`${API_SERVER_HOST}${acc.mainImage}`}
                              loading="lazy"
                              className="h-48 object-cover w-full rounded-t-2xl"
                              onError={(e) => {
                                e.target.style.display = "none";
                                const fallback = document.createElement("div");
                                fallback.className =
                                  "h-48 w-full flex items-center justify-center rounded-t-2xl bg-gray-200/60 text-gray-600 font-medium text-lg";
                                fallback.textContent = "이미지 준비중";
                                e.target.parentNode.appendChild(fallback);
                              }}
                            />
                          ) : (
                            <div className="h-48 w-full flex items-center justify-center rounded-t-2xl bg-gray-200/60 text-gray-600 font-medium text-lg">
                              이미지 준비중
                            </div>
                          )
                        }
                      >
                        <Meta
                          title={<span className="text-base font-semibold">{acc.title}</span>}
                          description={
                            <div className="text-gray-600 mt-3">
                              <p className="font-semibold text-sm mt-1 flex items-center gap-2 text-[#006D77]">
                                {acc.minPrice ? `${acc.minPrice.toLocaleString()}원` : "가격 미정"} / 1박
                              </p>
                              <p className="text-sm mt-1 truncate">{acc.address}</p>
                            </div>
                          }
                        />

                      </Card>
                    ))}
                  </div>

                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalCount}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    className="mt-6 text-center"
                  />
                </>
              )}
            </Spin>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccListPage;