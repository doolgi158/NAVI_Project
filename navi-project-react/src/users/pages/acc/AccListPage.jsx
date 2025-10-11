import MainLayout from "../../layout/MainLayout";
import { useEffect, useState } from "react";
import { Radio, Input, DatePicker, Select, Button, Card, message } from "antd"; 
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const { Meta } = Card;
const { Option } = Select;

const AccListPage = () => {
    const navigate = useNavigate();

    // 검색 조건
    const [searchType, setSearchType] = useState("region"); // region, apot, keyword
    const [city, setCity] = useState("");           // 행정시
    const [township, setTownship] = useState("");   // 읍면동
    const [keyword, setKeyword] = useState("");         // 숙소명
    const [isSearched, setIsSearched] = useState(false);

    // 숙소 리스트
    const [accommodations, setAccommodations] = useState([]);

    /* 행정구역 데이터 API 호출 */
    const [townshipList, setTownshipList] = useState([]); // 읍면동
    useEffect(() => {
        axios.get("/api/townships")
            .then(res => {
                setTownshipList(res.data);
            })
            .catch(() => message.error("읍면동 데이터를 불러오지 못했습니다."));
    }, []);

    const cityOptions = [...new Set(townshipList.map(t => t.sigunguName))]
        .map(city => ({ value: city, label: city }));

    const townshipOptions = city 
        ? townshipList
            .filter(t => t.sigunguName === city)
            .map(t => ({ value: t.townshipName, label: t.townshipName }))
        : [];
    
    // 검색 실행
    const handleSearch = async () => {
        try {
            const params = {};

            if (searchType === "region") {
                // ✅ 유효성 검사
                if (!city || !township) {
                    message.warning("행정시와 읍면을 모두 선택해주세요.");
                    return;
                }
                params.townshipName = township;
            } else if (searchType === "keyword" && keyword) {
                params.title = keyword;
            }

            const res = await axios.get("/api/accommodations", { params });
            setAccommodations(res.data);
            setIsSearched(true);

            if (res.data.length === 0) {
                message.info("검색 결과가 없습니다 😢");
            }
        } catch (err) {
            console.error("숙소 검색 실패:", err)
            message.error("숙소 목록을 불러오지 못했습니다.");
        }
    };
    
    const handleCardClick = (accId) => {
        navigate(`/accommodations/${accId}`);
    };
    
    // Antd Select 컴포넌트의 옵션 목록 (임시)
    const options = [
        { value: '1', label: '1명' },
        { value: '2', label: '2명' },
        { value: '3', label: '3명' },
    ];

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#fffde8] flex flex-col items-center pt-10 pb-12 px-8">
                <div className="w-full max-w-7xl"> 
                    {/* 검색 폼 영역 */}
                    <div className="bg-white/70 shadow-md rounded-2xl p-8 mb-8">
                        <h1 className="text-2xl font-bold mb-2">숙소를 찾아보세요 🏖️</h1>
                        <p className="text-gray-600 mb-6">여행 스타일에 맞게 검색해보세요!</p>

                        {/* 검색 타입 */}
                        <Radio.Group
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            className="mb-6"
                        >
                            <Radio.Button value="region">지역별 찾기</Radio.Button>
                            <Radio.Button value="spot">명소 주변 찾기</Radio.Button>
                            <Radio.Button value="keyword">숙소명 검색</Radio.Button>
                        </Radio.Group>

                        {/* 검색 입력 */}
                        <div className="flex flex-wrap gap-2 items-center justify-start">
                            {searchType === "region" && (
                                <>
                                    <Select
                                        placeholder="행정시 선택"
                                        className="w-[160px]"
                                        value={city || undefined}
                                        onChange={c => {
                                            setCity(c);
                                            setTownship("");
                                        }}
                                        options={cityOptions}
                                    />
                                    <Select
                                        placeholder="읍면 선택"
                                        className="w-[160px]"
                                        value={township || undefined}
                                        onChange={setTownship}
                                        options={townshipOptions}
                                        disabled={!city}
                                    />
                                </>
                            )}
                            {searchType === "spot" && (
                                <Input placeholder="관광명소 입력" className="w-[250px]" />
                            )}
                            {searchType === "keyword" && (
                                <Input
                                    placeholder="숙소명을 입력하세요"
                                    className="w-[250px]"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            )}
                            <DatePicker placeholder="Check-in" className="w-[120px]" />
                            <DatePicker placeholder="Check-out" className="w-[120px]" />
                            <Select placeholder="인원수" className="w-[80px]" options={options} /> 
                            <Select placeholder="객실수" className="w-[80px]" options={options} />
                            <Button type="primary" className="h-10 px-6 text-base" onClick={handleSearch}>검색</Button>
                        </div>
                    </div>
                    
                    {/* 🔹 검색 결과 */}
                    <div className="bg-white shadow-md rounded-2xl p-8 mb-10"> 
                        <h2 className="text-2xl font-bold mb-6">검색 결과</h2>
                        {!isSearched ? (
                            <div className="text-center text-gray-500 min-h-[300px] flex items-center justify-center border border-dashed border-gray-300 rounded-lg p-4">
                                <p className="text-lg">
                                    원하는 숙소를 찾아보세요! 🚀<br/>
                                    상단의 검색 조건을 입력하고 '검색' 버튼을 눌러주세요.
                                </p>
                            </div>
                        ) : accommodations.length === 0 ? (
                            <div className="text-center text-gray-400 py-20">
                                검색 결과가 없습니다 😢
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {accommodations.map((acc) => (
                                    <Card
                                        key={acc.accNo}
                                        hoverable
                                        className="rounded-xl shadow-sm cursor-pointer" 
                                        onClick={() => handleCardClick(acc.accNo)} 
                                        cover={
                                            <img 
                                                alt={acc.title} 
                                                src={acc.imageUrl} 
                                                className="h-60 object-cover w-full rounded-t-xl" 
                                            />
                                        }
                                    >
                                        <Meta
                                            title={<span className="text-lg font-bold">{acc.title}</span>}
                                            description={
                                                <div className="text-gray-600 mt-2">
                                                    <p>제주도 | 평점 4.5</p>
                                                    <p className="font-semibold text-base mt-1">120,000원 / 1박</p>
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
}

export default AccListPage;