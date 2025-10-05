import MainLayout from "../layout/MainLayout";

const TravelPage = () => {
    const travelItems = [1, 2, 3, 4, 5, 6, 7]; // 아이템 개수 증가

    // ✅ 추가: 지역별 태그 목록
    const regionTags = [
        '#제주시', '#제주 시내', '#애월', '#한림', '#한경', '#조천', 
        '#구좌', '#우도', '#추자', '#서귀포시', '#성산', '#서귀포 시내', 
        '#대정', '#안덕', '#중문', '#남원', '#표선'
    ];

    // 기존 해시태그 목록
    const tags = ['바다', '숲', '오름', '미술관', '체험', '공연'];

    // 목록 항목 컴포넌트
    const TravelListItem = ({ item }) => (
        <div 
            key={item} 
            className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-200 cursor-pointer bg-white"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg">비자림</h3>
                    <p className="text-sm text-gray-500 mb-2">제주시 &gt; 구좌읍</p>
                </div>
                {/* 찜하기 하트 아이콘 */}
                <div className="flex flex-col items-center">
                    <button className="text-red-500 hover:text-red-600 transition">
                        <svg 
                            className="w-5 h-5" 
                            fill="currentColor" 
                            viewBox="0 0 20 20" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <span className="text-xs text-red-500 mt-0.5">30,000</span>
                </div>
            </div>
            
            {/* 해시태그 목록 */}
            <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">#힐링</span>
                <span className="text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">#숲</span>
                <span className="text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">#산책</span>
            </div>
        </div>
    );

    return (
        <MainLayout>
            {/* 최상위 div: 수직 패딩(py)만 남김 */}
            <div className="py-8 min-h-[calc(100vh-140px)]"> 
                
                {/* 1. 검색 섹션 (좌우 여백은 MainLayout에서 px-24로 처리됨) */}
                <div className="mb-6 flex justify-center items-center">
                    <div className="w-full relative max-w-2xl"> 
                        {/* 검색창 */}
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {/* 돋보기 아이콘 */}
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            🔍
                        </div>
                    </div>
                </div>

                {/* 2. 통계 및 정렬 버튼 섹션 */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-base font-semibold text-gray-800">총 5,309건</p>
                    <div className="flex space-x-4 text-sm">
                        <button className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">리뷰순</button>
                        <button className="text-gray-500 hover:text-blue-600">최신순</button>
                        <button className="text-gray-500 hover:text-blue-600">조회순</button>
                    </div>
                </div>

                {/* 3. 목록, 필터 및 상세 정보 레이아웃 */}
                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* A. 좌측 필터/목록 영역 */}
                    <div className="lg:w-2/5 flex flex-col space-y-4">
                        
                        {/* A-1. 지역별 태그 검색 영역  */}
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm relative">
                            <div className="absolute top-[-10px] right-4 bg- border border-gray-300 rounded-full px-3 py-0.5 text-xs text-orange-500 font-semibold flex items-center shadow-sm cursor-pointer">
                                지역별 태그 검색
                                <span className="ml-1 text-xs">▲</span>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {regionTags.map((tag) => (
                                    <button 
                                        key={tag} 
                                        className="text-sm px-3 py-1 border border-amber-800 text-amber-800 rounded-full hover:bg-amber-50 transition"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>


                        {/* A-2. 목록 영역 */}
                        <div className="space-y-4">
                            {travelItems.map((item) => (
                                <TravelListItem key={item} item={item} />
                            ))}
                        </div>
                        
                    </div>

                    {/* B. 우측 상세 정보/지도 영역 */}
                    <div className="lg:w-3/5 border border-gray-200 rounded-lg bg-gray-100 flex items-center justify-center 
                                    h-[600px] lg:h-auto lg:min-h-[1000px] shadow-md p-4">
                        <span className="text-gray-500 text-lg">상세 정보 또는 지도 영역</span>
                    </div>
                </div>

                {/* 4. 페이지네이션 */}
                <div className="flex justify-center mt-8">
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-500 cursor-pointer p-2 hover:bg-gray-100 rounded-full">&lt;&lt;</span>
                        <span className="text-gray-500 cursor-pointer p-2 hover:bg-gray-100 rounded-full">&lt;</span>
                        <button className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-full shadow-md">1</button>
                        <button className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-full">2</button>
                        <button className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-full">3</button>
                        <span className="text-gray-500 cursor-pointer p-2 hover:bg-gray-100 rounded-full">&gt;</span>
                        <span className="text-gray-500 cursor-pointer p-2 hover:bg-gray-100 rounded-full">&gt;&gt;</span>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default TravelPage;