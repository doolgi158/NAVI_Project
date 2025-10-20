import axios from "axios";
import dayjs from "dayjs";
import useTownshipData from "../../../common/hooks/useTownshipData";
import MainLayout from "@/users/layout/MainLayout";
import { useState, useMemo, useCallback } from "react";
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

  const savedSearch = useSelector((state) => state.acc.searchState) || {};

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

  const handleSearch = useCallback(async () => {
    if (isTownshipLoading) {
      message.warning("읍면동 데이터를 로딩 중입니다. 잠시만 기다려주세요.");
      return;
    }
    if (townshipError) {
      message.error("읍면동 데이터 로드에 실패했습니다. 페이지를 새로고침하거나 나중에 다시 시도해 주세요.");
      return;
    }

    try {
      const params = {};

      if (searchType === "region") {
        if (!city || !township) {
          message.warning("행정시와 읍면을 모두 선택해주세요.");
          return;
        }
        params.townshipName = township;
      } else if (searchType === "keyword") {
        if (keyword && keyword.trim() !== "") {
          params.title = keyword.trim();
        } else {
          message.info("숙소명을 입력해주세요.");
          return;
        }
      } else {
        if (spot && spot.trim() !== "") {
          params.spot = spot.trim();
        } else {
          message.info("관광명소를 입력해주세요.");
          return;
        }
      }

      const dateRangeArray = dateRange ? dateRange.map((d) => d.format("YYYY-MM-DD")) : null;
      if (dateRangeArray) {
        params.checkIn = dateRangeArray[0];
        params.checkOut = dateRangeArray[1];
      }

      if (guestCount) params.guestCount = guestCount;
      if (roomCount) params.roomCount = roomCount;

      const res = await axios.get("/api/accommodations", { params });
      setAccommodations(res.data);
      setIsSearched(true);
      setCurrentPage(1);

      dispatch(
        setSearchState({
          searchType,
          city,
          township,
          keyword,
          spot,
          guestCount,
          roomCount,
          dateRange: dateRangeArray,
          isSearched: true,
          accommodations: res.data,
        })
      );

      if (res.data.length === 0) message.info("검색 결과가 없습니다 😢");
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

  const handleCardClick = useCallback(
    (accId) => {
      console.log(accId);
      dispatch(setSelectedAcc(accId));
      navigate(`/accommodations/${accId.accId}`);
    },
    [dispatch, navigate]
  );

  const startIndex = (currentPage - 1) * pageSize;
  const currentData = accommodations.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center pt-10 pb-12 px-8">
        <div className="w-full max-w-7xl">
          {/* ========================= 검색 폼 ========================= */}
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
                <Input placeholder="관광명소 입력" className="min-w-[250px] flex-grow" />
              )}

              {searchType === "keyword" && (
                <Input
                  placeholder="숙소명을 입력하세요"
                  className="min-w-[300px] flex-grow"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              )}

              <RangePicker
                style={{ minWidth: 200 }}
                format="YYYY-MM-DD"
                placeholder={["체크인 날짜", "체크아웃 날짜"]}
                size="large"
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

          {/* ===================== 검색 결과 ===================== */}
          <div className="bg-white shadow-md rounded-2xl p-8 mb-10">
            <h2 className="text-2xl font-bold mb-6">검색 결과</h2>

            {!isSearched ? (
              <div className="text-center text-gray-500 min-h-[300px] flex items-center justify-center border border-dashed border-gray-300 rounded-lg p-4">
                <p className="text-lg">
                  원하는 숙소를 찾아보세요! 🚀
                  <br />
                  상단의 검색 조건을 입력하고 '검색' 버튼을 눌러주세요.
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
                              acc.accImage.startsWith("/uploads/")
                                ? `${API_SERVER_HOST}${acc.accImage}`
                                : `${API_SERVER_HOST}/uploads/acc/${acc.accImage}`
                            }
                            className="h-60 object-cover w-full rounded-t-xl"
                            onError={(e) => {
                              e.target.style.display = "none";
                              const fallback = document.createElement("div");
                              fallback.className =
                                "h-60 w-full flex items-center justify-center rounded-t-xl bg-gray-200/60 backdrop-blur-md text-gray-600 font-medium text-lg select-none";
                              fallback.textContent = "이미지 준비중";
                              e.target.parentNode.appendChild(fallback);
                            }}
                          />
                        ) : (
                          <div className="h-60 w-full flex items-center justify-center rounded-t-xl bg-gray-200/60 backdrop-blur-md text-gray-600 font-medium text-lg select-none">
                            이미지 준비중
                          </div>
                        )
                      }
                    >
                      <Meta
                        title={<span className="text-lg font-bold">{acc.title}</span>}
                        description={
                          <div className="text-gray-600 mt-2">
                            <div className="flex items-center justify-between font-semibold text-base mt-1">
                              <span>{acc.minPrice?.toLocaleString() || 0}원 / 1박</span>
                              <span className="flex items-center gap-1 text-gray-500 text-sm">
                                <EyeOutlined />
                                {acc.viewsCount ?? 0}
                              </span>
                            </div>
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
