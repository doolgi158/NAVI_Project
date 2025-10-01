import MainLayout from "../layout/MainLayout";

const TravelPage = () => {
    const travelItems = [1, 2, 3, 4, 5];

    return (
        <MainLayout>
            <div className="p-4 sm:p-6 bg-white min-h-full">
                {/* 1. 검색 섹션 */}
                <div className="mb-6 flex justify-center items-center">
                    <div className="w-full max-w-4xl relative">
                        {/* 검색창 */}
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {/* 돋보기 아이콘 (임시) */}
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            🔍
                        </div>
                    </div>
                </div>

                {/* 2. 통계 및 정렬 버튼 섹션 */}
                <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
                    <p className="text-sm text-gray-600">총 5,309건</p>
                    <div className="flex space-x-2 text-sm">
                        <button className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">최신순</button>
                        <button className="text-gray-500 hover:text-blue-600">인기순</button>
                        <button className="text-gray-500 hover:text-blue-600">조회순</button>
                    </div>
                </div>

                {/* 3. 목록 및 상세 정보 레이아웃 */}
                <div className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto">
                    {/* A. 좌측 목록 영역 (md:w-1/2 또는 md:w-2/5 등으로 조절 가능) */}
                    <div className="md:w-2/5 space-y-4">
                        {travelItems.map((item) => (
                            <div key={item} className="p-3 border border-gray-200 rounded-lg shadow hover:shadow-lg transition duration-200 cursor-pointer">
                                <h3 className="font-bold">비자림</h3>
                                <p className="text-sm text-gray-500">제주시 &gt; 구좌읍</p>
                                <div className="flex items-center text-red-500 text-sm">
                                    ❤️ 30,000
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* B. 우측 상세 정보/지도 영역 */}
                    <div className="md:w-3/5 border border-gray-200 rounded-lg bg-gray-100 flex items-center justify-center h-96 md:h-auto p-4">
                        <span className="text-gray-500">상세 정보 또는 지도 영역</span>
                    </div>
                </div>

                {/* 4. 페이지네이션 */}
                <div className="flex justify-center mt-8 max-w-4xl mx-auto">
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-500 cursor-pointer">&lt;&lt;</span>
                        <span className="text-gray-500 cursor-pointer">&lt;</span>
                        <button className="px-3 py-1 bg-blue-500 text-white rounded">1</button>
                        <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded">2</button>
                        <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded">3</button>
                        <span className="text-gray-500 cursor-pointer">&gt;</span>
                        <span className="text-gray-500 cursor-pointer">&gt;&gt;</span>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default TravelPage;