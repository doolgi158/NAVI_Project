import MainLayout from "../../layout/MainLayout";
import axios from "axios";
import { useEffect, useState } from "react";
import { Radio, Input, DatePicker, Select, Button, Card, message, InputNumber } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // ✅ Redux 추가
import { setSearchState, setSelectedAcc } from "../../../common/slice/accSlice"; // ✅ 새 액션 불러오기 (검색 상태 저장용)

const { Meta } = Card;
const { RangePicker } = DatePicker;

const AccListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ✅ Redux 전역 상태 불러오기 (뒤로가기 시 검색 조건 유지용) */
  const savedSearch = useSelector((state) => state.acc.searchState) || {};

  /* == 검색 조건 상태 관리 == */
  const [searchType, setSearchType] = useState(savedSearch.searchType || "region");     // searchType : region, spot, keyword
  const [city, setCity] = useState(savedSearch.city);
  const [township, setTownship] = useState(savedSearch.township);
  const [keyword, setKeyword] = useState(savedSearch.keyword);
  const [spot, setSpot] = useState(savedSearch.spot);
  const [guestCount, setGuestCount] = useState(savedSearch.guestCount);
  const [roomCount, setRoomCount] = useState(savedSearch.roomCount);

  const [isSearched, setIsSearched] = useState(savedSearch.isSearched || false);

  /* == API 데이터 저장하는 상태 변수 == */
  const [accommodations, setAccommodations] = useState(savedSearch.accommodations || []);
  const [townshipList, setTownshipList] = useState([]);

  /* == 읍면동 데이터 sessionStorage 캐싱 == */
  useEffect(() => {
    const cachedTownships = sessionStorage.getItem("townshipList");

    if (cachedTownships) {
      // 세션 캐시에 있는 경우 즉시 복원
      setTownshipList(JSON.parse(cachedTownships));
      return;
    }

    // 캐시에 없을 경우 서버 요청
    axios
      .get("/api/townships")
      .then((res) => {
        setTownshipList(res.data);
        sessionStorage.setItem("townshipList", JSON.stringify(res.data));
      })
      .catch(() => message.error("읍면동 데이터를 불러오지 못했습니다."));
  }, []);

  /* == 행정시/읍면동 옵션 설정 == */
  const cityOptions = [...new Set(townshipList.map((t) => t.sigunguName))].map((city) => (
    {value: city, label: city}
  ));

  const townshipOptions = city
    ? townshipList
        .filter((t) => t.sigunguName === city)
        .map((t) => ({ value: t.townshipName, label: t.townshipName }))
    : [];

  /* == 숙소 검색 함수 == */
  const handleSearch = async () => {
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
          message.info("숙소를 입력해주세요.");
        }
      } else {
        if (spot && spot.trim() !== ""){
          params.spot = spot.trim();    // [ TODO ]: AccSerchRequestDTO에 spot column 적용시켜야함
        }else {
          message.info("관광명소를 입력해주세요.")
        }
      }

      const res = await axios.get("/api/accommodations", { params });

      setAccommodations(res.data);
      setIsSearched(true);

      // Redux에 검색 상태 전체 저장 (뒤로 가기 복원용)
      dispatch(
        setSearchState({
          searchType,
          city,
          township,
          keyword,
          guestCount,
          roomCount,
          isSearched: true,
          accommodations: res.data,
          // page,    // [ TODO ]: 페이징 처리 필수 
        })
      );

      if (res.data.length === 0) { message.info("검색 결과가 없습니다 😢"); }
    } catch (err) {
      console.error("숙소 검색 실패:", err);
      message.error("숙소 목록을 불러오지 못했습니다.");
    }
  };

  /* == 숙소 클릭 시 상세 페이지 이동 == */
  const handleCardClick = (accId) => {
    dispatch(setSelectedAcc(accId));
    navigate("/accommodations/detail");
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fffde8] flex flex-col items-center pt-10 pb-12 px-8">
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
              <Radio.Button value="region">지역별 찾기</Radio.Button>   // [ TODO ] : #FF8866 색 적용
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
              style={{ minWidth: 200}}
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

            {/* ✅ 버튼: 항상 오른쪽 끝 고정 */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {accommodations.map((acc) => (
                  <Card
                    key={acc.accId}
                    hoverable
                    className="rounded-xl shadow-sm cursor-pointer"
                    onClick={() => handleCardClick(acc.accId)}
                    cover={
                      acc.imageUrl ? (
                        <img
                          alt={acc.title}
                          src={acc.imageUrl}
                          className="h-60 object-cover w-full rounded-t-xl"
                        />
                      ) : (
                        <div className="h-60 w-full bg-slate-500 flex items-center justify-center rounded-t-xl text-gray-500 text-sm"></div>
                      )
                    }
                  >
                    <Meta
                      title={<span className="text-lg font-bold">{acc.title}</span>}
                      description={
                        <div className="text-gray-600 mt-2">
                          <p className="font-semibold text-base mt-1">{acc.minPrice}원 / 1박</p>
                          <p>{acc.address}</p>
                        </div>
                      }
                    />
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccListPage;
