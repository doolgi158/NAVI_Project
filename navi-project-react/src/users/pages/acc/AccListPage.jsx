import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Radio,
  Input,
  DatePicker,
  Select,
  Button,
  Card,
  message,
  InputNumber,
  Pagination,
  Checkbox,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSearchState, setSelectedAcc } from "../../../common/slice/accSlice";
import { API_SERVER_HOST } from "../../../common/api/naviApi";
import useTownshipData from "../../../common/hooks/useTownshipData";
import MainLayout from "@/users/layout/MainLayout";
import axios from "axios";
import dayjs from "dayjs";

const { Meta } = Card;
const { RangePicker } = DatePicker;

const AccListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const savedSearch = useSelector((state) => state.acc.searchState) || {};

  const { townshipList, isLoading: isTownshipLoading, error: townshipError } =
    useTownshipData();

  // ✅ 검색조건 복원
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
        setAccommodations(parsed.accommodations || []);
        setIsSearched(parsed.isSearched || false);
      } catch (e) {
        console.warn("searchState 복원 실패:", e);
      }
    }
  }, [dispatch]);

  /* === 상태 관리 === */
  const [searchType, setSearchType] = useState(savedSearch.searchType || "region");
  const [city, setCity] = useState(savedSearch.city);
  const [township, setTownship] = useState(savedSearch.township);
  const [keyword, setKeyword] = useState(savedSearch.keyword);
  const [spot, setSpot] = useState(savedSearch.spot);
  const [guestCount, setGuestCount] = useState(savedSearch.guestCount);
  const [roomCount, setRoomCount] = useState(savedSearch.roomCount);
  const [isSearched, setIsSearched] = useState(savedSearch.isSearched || false);
  const [accommodations, setAccommodations] = useState(savedSearch.accommodations || []);
  const [sortOption, setSortOption] = useState("view");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dateRange, setDateRange] = useState(
    savedSearch.dateRange && savedSearch.dateRange.length === 2
      ? [dayjs(savedSearch.dateRange[0]), dayjs(savedSearch.dateRange[1])]
      : null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  /* === 옵션 세팅 === */
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

  /* === 숙소 검색 === */
  const handleSearch = useCallback(async () => {
    if (isTownshipLoading) {
      message.warning("읍면동 데이터를 로딩 중입니다. 잠시만 기다려주세요.");
      return;
    }
    if (townshipError) {
      message.error("읍면동 데이터 로드 실패. 다시 시도해주세요.");
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
      message.warning(
        `${missingFields.join(", ")} ${
          missingFields.length > 1 ? "항목들을" : "항목을"
        } 입력해주세요.`
      );
      return;
    }

    try {
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
      };

      const res = await axios.get(`${API_SERVER_HOST}/api/accommodations`, { params });
      let resultData = res.data || [];
      console.log(resultData);

      setAccommodations(resultData);
      setIsSearched(true);
      setCurrentPage(1);

      const newSearchState = {
        searchType,
        city,
        township,
        keyword,
        guestCount,
        roomCount,
        dateRange: [params.checkIn, params.checkOut],
        isSearched: true,
        accommodations: resultData,
        selectedCategories,
      };

      dispatch(setSearchState(newSearchState));
      localStorage.setItem("searchState", JSON.stringify(newSearchState));
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
    selectedCategories,
    sortOption,
    dispatch,
  ]);

  /* === 숙소 카드 클릭 (객체 전체 전달) === */
  const handleCardClick = useCallback(
    (acc) => {
      if (!acc?.accId) {
        console.warn("⚠️ 숙소 정보 누락됨");
        message.error("숙소 정보가 올바르지 않습니다.");
        return;
      }
      
      // ✅ Redux + localStorage에 선택 숙소 저장
      dispatch(setSelectedAcc(acc));
      localStorage.setItem("selectedAccId", acc.accId);

      // ✅ 뒤로가기 복원용 검색조건 저장
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

      // ✅ 상세 페이지로 이동
      navigate("/accommodations/detail");
    },
    [dispatch, navigate, searchType, city, township, keyword, spot, guestCount, roomCount, dateRange]
  );

  /* === 페이지네이션 === */
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startIndex = (currentPage - 1) * pageSize;
  const currentData = accommodations.slice(startIndex, startIndex + pageSize);

  /* === 렌더링 === */
  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center pt-10 pb-12 px-8">
        <div className="w-full max-w-7xl">
          {/* 🔍 검색 폼 + 필터 통합 */}
          <div className="bg-white/70 shadow-md rounded-2xl p-8 mb-8">
            <h1 className="text-2xl font-bold mb-2">숙소를 찾아보세요 🏖️</h1>
            <p className="text-gray-600 mb-6">여행 스타일에 맞게 검색해보세요!</p>

            <Radio.Group
              value={searchType}
              onChange={(e) => {
                const type = e.target.value;
                setSearchType(type);

                // 탭 전환 시 불필요한 값 초기화
                if (type === "region") {
                  setKeyword("");
                  setSpot("");
                } else if (type === "keyword") {
                  setCity("");
                  setTownship("");
                  setSpot("");
                }
              }}
              className="mb-6"
              size="large"
            >
              <Radio.Button value="region">지역별 찾기</Radio.Button>
              <Radio.Button value="keyword">숙소명 검색</Radio.Button>
            </Radio.Group>

            

            <div className="flex flex-wrap gap-2 items-center justify-start mb-6">
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
                  const today = dayjs().startOf("day");
                  return current && current < today;
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

            {/* 🔸 정렬/카테고리 구분선 */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* 🔹 정렬 + 카테고리 필터 */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">정렬 기준:</span>
                <Select
                  value={sortOption}
                  onChange={(value) => setSortOption(value)}
                  style={{ width: 180 }}
                  options={[
                    { value: "view", label: "조회순" },
                    { value: "minPrice", label: "낮은가격순" },
                    { value: "maxPrice", label: "높은가격순" },
                    { value: "recent", label: "최신등록순" },
                    { value: "title", label: "이름순" },
                  ]}
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-semibold text-gray-700">숙소 종류:</span>
                <Checkbox.Group
                  options={["호텔", "리조트/콘도", "모텔", "펜션", "게스트하우스/민박"]}
                  value={selectedCategories}
                  onChange={(values) => setSelectedCategories(values)}
                />
              </div>
            </div>
          </div>

          {/* ✅ 검색 결과 */}
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
              <div className="text-center text-gray-400 py-20">
                검색 결과가 없습니다 😢
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {currentData.map((acc, index) => (
                    <Card
                      key={acc.accId || `acc-${index}`}
                      hoverable
                      className="rounded-xl shadow-sm cursor-pointer transition-transform transform hover:scale-[1.02] duration-200"
                      onClick={() => handleCardClick(acc)}
                      cover={
                        acc.mainImage ? (
                          <img
                            alt={acc.title}
                            src={`${API_SERVER_HOST}${acc.mainImage}`}
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
                          <div className="text-gray-600 mt-2">
                            <p className="font-semibold text-base mt-1 flex items-center gap-2">
                              {acc.minPrice
                                ? `${acc.minPrice.toLocaleString()}원`
                                : "가격 미정"}{" "}
                              / 1박
                              {acc.viewCount !== undefined && (
                                <span className="flex items-center text-gray-500 text-sm ml-2">
                                  <EyeOutlined style={{ marginRight: 4 }} />{" "}
                                  {acc.viewCount.toLocaleString()}
                                </span>
                              )}
                            </p>
                            <p>{acc.address}</p>
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
      </div>
    </MainLayout>
  );
};

export default AccListPage;
