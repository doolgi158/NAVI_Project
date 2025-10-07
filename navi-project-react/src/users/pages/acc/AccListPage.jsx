import MainLayout from "../../layout/MainLayout";
import { useState } from "react";
import { Radio, Input, DatePicker, Select, Button, Card } from "antd"; 
import { useNavigate } from 'react-router-dom';

const { Meta } = Card;

// ⭐ 1. id 대신 accNo 사용
const mockAccommodations = [
    {
        accNo: 1, // ⭐ accNo (숙소 번호)
        name: "오션뷰 풀빌라",
        imageUrl: "https://images.unsplash.com/photo-1563299796-03f39a7522d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    },
    {
        accNo: 2, // ⭐ accNo (숙소 번호)
        name: "감성 한옥 스테이",
        imageUrl: "https://images.unsplash.com/photo-1558249821-b3edb015b635?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    },
    {
        accNo: 3, // ⭐ accNo (숙소 번호)
        name: "모던 시티 호텔",
        imageUrl: "https://images.unsplash.com/photo-1549294413-26f195200c82?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    },
];

const AccSearchPage = () => {
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState("region");
    const [isSearched, setIsSearched] = useState(false); 

    const handleSearch = () => {
        setIsSearched(true); 
    };
    
    // ⭐ 2. accNo를 파라미터로 받고 경로를 /accommodations/accNo로 설정
    const handleCardClick = (accNo) => {
        // /accommodations/1, /accommodations/2 등의 경로로 이동
        navigate(`/accommodations/${accNo}`); 
    };
    
    // Antd Select 컴포넌트의 옵션 목록 (임시)
    const options = [
        { value: '1', label: '1명' },
        { value: '2', label: '2명' },
        { value: '3', label: '3명' },
    ];

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#fffde8] flex flex-col items-center pt-10 px-4">
                
                {/* 메인 컨테이너 */}
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
                            <Radio.Button value="name">숙소명 검색</Radio.Button>
                        </Radio.Group>

                        {/* 검색 폼 (크기 조정) */}
                        <div className="flex flex-wrap gap-2 items-center justify-start">
                            {searchType === "region" && (
                                <>
                                    <Select placeholder="행정시 선택" className="w-[120px]" /> 
                                    <Select placeholder="읍면 선택" className="w-[120px]" />
                                </>
                            )}
                            {searchType === "spot" && (
                                <Input placeholder="관광명소 입력" className="w-[250px]" />
                            )}
                            {searchType === "name" && (
                                <Input placeholder="숙소명 입력" className="w-[250px]" />
                            )}
                            <DatePicker placeholder="Check-in" className="w-[120px]" />
                            <DatePicker placeholder="Check-out" className="w-[120px]" />
                            <Select placeholder="인원수" className="w-[80px]" options={options} /> 
                            <Select placeholder="객실수" className="w-[80px]" options={options} />
                            <Button type="primary" className="h-10 px-6 text-base" onClick={handleSearch}>검색</Button>
                        </div>
                    </div>
                    
                    {/* 검색 결과 섹션 (새로운 컨테이너 적용) */}
                    <div className="bg-white shadow-md rounded-2xl p-8 mb-10"> 
                        <h2 className="text-2xl font-bold mb-6">검색 결과</h2>

                        {/* 조건부 렌더링: 검색 전/후 */}
                        {!isSearched ? (
                            <div className="text-center text-gray-500 min-h-[300px] flex items-center justify-center border border-dashed border-gray-300 rounded-lg p-4">
                                <p className="text-lg">
                                    원하는 숙소를 찾아보세요! 🚀<br/>
                                    상단의 검색 조건을 입력하고 '검색' 버튼을 눌러주세요.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {mockAccommodations.map((acc) => (
                                    <Card
                                        // ⭐ 3. key에 accNo 사용
                                        key={acc.accNo}
                                        hoverable
                                        className="rounded-xl shadow-sm cursor-pointer" 
                                        // ⭐ 4. 클릭 이벤트에 acc.accNo 전달
                                        onClick={() => handleCardClick(acc.accNo)} 
                                        cover={
                                            <img 
                                                alt={acc.name} 
                                                src={acc.imageUrl} 
                                                className="h-60 object-cover w-full rounded-t-xl" 
                                            />
                                        }
                                    >
                                        <Meta
                                            title={<span className="text-lg font-bold">{acc.name}</span>}
                                            description={
                                                <div className="text-gray-600 mt-2">
                                                    <p>제주도 | 평점 4.5</p>
                                                    <p className="font-semibold text-base mt-1">120,000원 / 1박</p>
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

export default AccSearchPage;