import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MainLayout from '../../layout/MainLayout.jsx';
import axios from 'axios'; 


// =========================================================================
// 💡 API 연동 환경 설정 및 Mock 데이터 함수 (주석 처리됨)
// =========================================================================

/**
 * 🚀 실제 서버 연동을 위한 메인 데이터 호출 함수
 */
const getTravelData = async (domain, pageParam) => {
    // ----------------------------------------------------------------------
    // ✅ 실제 API 사용 시: fetch 대신 axios와 프록시 경로를 사용하도록 수정
    const apiUrl = `/api/${domain}`; // URL: /api/travel (Vite가 /travel로 변환하여 8080에 전달)
    
    try {
        // axios.get을 사용하여 GET 요청 전송
        const response = await axios.get(apiUrl, {
            params: { // pageParam을 쿼리 매개변수로 전달
                page: pageParam.page,
                size: pageParam.size
            }
        });
        
        // axios는 응답 객체에서 data 속성을 통해 JSON 데이터를 제공합니다.
        return response.data; 
    } catch (error) {
        // API 통신 오류 발생 시
        console.error("여행지 목록 로딩 실패 (API 통신 오류):", error.message);
        
        throw error;
    }


};


// =========================================================================
// 💡 Ant Design 스타일 컴포넌트 (Tailwind 기반 스타일)
// =========================================================================

// AntD Card 컴포넌트 시뮬레이션
const AntDCard = ({ item, onClick, isSelected }) => (
    <div 
        className={`bg-white rounded-xl shadow-lg border-2 p-4 cursor-pointer transition duration-300 transform hover:shadow-xl hover:-translate-y-1 ${
            isSelected ? 'border-blue-500 shadow-blue-300/50 scale-[1.01]' : 'border-gray-200'
        } flex space-x-4`} 
        onClick={() => onClick(item)}
    >
        {/* ✅ 좌측 이미지 영역 (고정 크기) */}
        <div className="flex-shrink-0 w-36 h-24 sm:w-40 sm:h-28">
            <img 
                src={item.thumbnailPath || "https://placehold.co/112x112/cccccc/333333?text=No+Image"} 
                alt={item.title} 
                className="w-full h-full object-cover rounded-lg shadow-md"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/112x112/cccccc/333333?text=No+Image"; }}
            />
        </div>

        {/* ✅ 우측 콘텐츠 영역 */}
        <div className="flex-grow min-w-0 justify-center">
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-1 truncate">{item.title}</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">{item.region1Name}{' > '}{item.region2Name}</p>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">{item.tags}</p>
            <div className="text-xs text-gray-400 mb-2 line-clamp-2">{item.address}</div>

            {/* 통계 정보 */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 font-medium pt-2 border-t border-gray-100">
                {/* Views: bi-eye-fill */}
                <div className="flex items-center space-x-1">
                    <i className="bi bi-eye-fill text-base text-blue-400"></i>
                    <span>{item.views.toLocaleString()}</span>
                </div>
                {/* Likes: bi-suit-heart-fill */}
                <div className="flex items-center space-x-1">
                    <i className="bi bi-suit-heart-fill text-red-500"></i>
                    <span>{item.likes.toLocaleString()}</span>
                </div>
            </div>
        </div>
    </div>
);

// AntD Pagination 시뮬레이션
const AntDPagination = ({ pageResult, handlePageClick, loading }) => (
    <div className="flex justify-center mt-10">
        <div className="flex items-center space-x-1">
            {/* Previous Block (<<) */}
            <button 
                className={`p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition ${pageResult.startPage > 1 ? '' : 'opacity-50 cursor-not-allowed'}`}
                onClick={() => handlePageClick(pageResult.startPage > 1 ? pageResult.startPage - 10 : 1)}
                disabled={loading || pageResult.startPage <= 1}
            >
                &lt;&lt;
            </button>

            {/* Previous Page (<) */}
            <button 
                className={`p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition ${pageResult.page > 1 ? '' : 'opacity-50 cursor-not-allowed'}`}
                onClick={() => handlePageClick(pageResult.page - 1)}
                disabled={loading || pageResult.page <= 1}
            >
                &lt;
            </button>

            {/* Page Numbers */}
            {pageResult.pageList.map(p => (
                <button 
                    key={p} 
                    onClick={() => handlePageClick(p)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                        pageResult.page === p 
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={loading}
                >
                    {p}
                </button>
            ))}
            
            {/* Next Page (>) */}
            <button 
                className={`p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition ${pageResult.page < pageResult.totalPages ? '' : 'opacity-50 cursor-not-allowed'}`}
                onClick={() => handlePageClick(pageResult.page + 1)}
                disabled={loading || pageResult.page >= pageResult.totalPages}
            >
                &gt;
            </button>

            {/* Next Block (>>) */}
            <button 
                className={`p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition ${pageResult.endPage < pageResult.totalPages ? '' : 'opacity-50 cursor-not-allowed'}`}
                onClick={() => handlePageClick(pageResult.endPage + 1)}
                disabled={loading || pageResult.endPage >= pageResult.totalPages}
            >
                &gt;&gt;
            </button>
        </div>
    </div>
);

// =========================================================================
// TravelPage 컴포넌트
// =========================================================================
const TravelPage = () => {
    const [pageResult, setPageResult] = useState({
        dtoList: [],
        totalElements: 0,
        totalPages: 0,
        page: 1,
        size: 10,
        startPage: 1,
        endPage: 1,
        pageList: []
    });

    const [pageParam, setPageParam] = useState({ page: 1, size: 10 });
    const [loading, setLoading] = useState(false); 
    const [hasError, setHasError] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // 선택된 항목 상태

    // ✅ API 호출 함수 (무한 루프 방지를 위해 pageParam만 종속성으로 설정)
    const fetchTravelList = useCallback(() => {
        // 이미 로딩 중인 경우 중복 호출 방지
        if (loading) return;
        
        setLoading(true);
        setHasError(false);

        // getTravelData 함수를 호출
        getTravelData('travel', pageParam).then(data => {
            const currentPage = data.number + 1;
            const startBlock = Math.floor((data.number) / 10) * 10 + 1;
            const endBlock = Math.min(data.totalPages, Math.floor((data.number) / 10) * 10 + 10);
            const pageList = Array.from({ length: endBlock - startBlock + 1 }, (_, i) => startBlock + i);

            if (!data.content) {
                // Spring Boot Page 객체에는 content 필드가 반드시 있어야 합니다.
                throw new Error("API에서 유효한 데이터(content)를 받지 못했습니다.");
            }
            
            setPageResult({
                dtoList: data.content, 
                totalElements: data.totalElements,
                totalPages: data.totalPages,
                page: currentPage, 
                size: data.size,
                startPage: startBlock,
                endPage: endBlock,
                pageList: pageList
            });
            setLoading(false);

            // 데이터 로드 후 첫 항목을 상세 정보로 자동 선택
            if (data.content.length > 0) {
                // 이전 선택 항목이 현재 페이지에 있으면 유지, 없으면 첫 항목 선택
                setSelectedItem(prevSelectedItem => {
                    // API 응답 객체가 travelId를 사용하더라도, selectedItem의 비교 기준은 id로 유지할 수 있습니다. 
                    // 하지만 정확한 비교를 위해 selectedItem.id를 item.travelId로 변경하는 것이 좋습니다.
                    const currentSelectedItem = prevSelectedItem && data.content.find(item => item.travelId === prevSelectedItem.travelId);
                    return currentSelectedItem || data.content[0];
                });
            } else {
                setSelectedItem(null);
            }

        }).catch(error => {
            // API 통신 실패 시 에러 처리
            console.error("여행지 목록 로딩 실패:", error.message);
            setPageResult(prev => ({ ...prev, dtoList: [], totalElements: 0, pageList: [] }));
            setHasError(true); 
            setLoading(false);
            setSelectedItem(null);
        });
    }, [pageParam]); // 💡 무한 루프 방지: pageParam만 종속성으로 지정

    useEffect(() => {
        fetchTravelList();
    }, [fetchTravelList]); 

    // ✅ 페이지네이션 클릭 핸들러
    const handlePageClick = (pageNumber) => {
        if (!loading && pageNumber > 0 && pageNumber <= pageResult.totalPages) {
            setPageParam(prev => ({ ...prev, page: pageNumber }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // ✅ 카드 클릭 시 상세 정보 설정
    const handleCardClick = (item) => {
        setSelectedItem(item);
    };

    const regionTags = ["제주시", "서귀포시", "동부", "서부", "남부", "북부"];
    const totalCountText = loading ? "로딩 중..." : `총 ${pageResult.totalElements.toLocaleString()}개`;


    return (
        <MainLayout>
            <div className="py-8 min-h-[calc(100vh-140px)] space-y-8"> 
                
                {/* AntD Input.Search 시뮬레이션 */}
                <div className="flex justify-center">
                    <div className="w-full max-w-3xl flex shadow-lg rounded-lg overflow-hidden border border-blue-300"> 
                        <input
                            type="text"
                            placeholder="여행지를 검색하세요. (예: 비자림, 한라산)"
                            className="w-full p-4 text-lg border-none focus:outline-none placeholder-gray-400"
                        />
                        <button className="bg-blue-500 text-white px-6 text-lg hover:bg-blue-600 transition flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </button>
                    </div>
                </div>

                {/* 통계, 정렬 및 태그 섹션 */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* 통계 및 정렬 */}
                    <div className="flex items-center space-x-6">
                        <p className="text-base font-semibold text-gray-800">{totalCountText}</p>
                        <div className="flex space-x-4 text-sm font-medium">
                            <button className="text-blue-600 border-b-2 border-blue-600 pb-1">최신순</button>
                            <button className="text-gray-500 hover:text-blue-600">인기순</button>
                        </div>
                    </div>

                    {/* 지역 태그 (AntD Tag 시뮬레이션) */}
                    <div className="flex flex-wrap gap-2">
                        {regionTags.map((tag) => (
                            <button 
                                key={tag} 
                                className="text-sm px-3 py-1 border border-blue-400 text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100 transition"
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 목록 및 상세 정보 레이아웃 */}
                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* A. 좌측 목록 영역 */}
                    <div className="lg:w-4/12 flex flex-col space-y-4">
                        
                        {loading ? (
                            <div className="p-12 text-center text-gray-500 bg-white rounded-lg shadow-md min-h-[400px] flex flex-col items-center justify-center">
                                <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-lg font-medium">데이터를 불러오는 중입니다...</p>
                            </div>
                        ) : hasError || pageResult.dtoList.length === 0 ? (
                            <div className="p-12 text-center text-red-500 border border-red-200 rounded-lg bg-red-50 font-bold text-lg shadow-md min-h-[400px] flex flex-col items-center justify-center">
                                찾을 수 없습니다
                                <p className="text-sm font-normal mt-2 text-red-400">검색 결과가 없거나 데이터를 불러오는 데 실패했습니다.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pageResult.dtoList.map((item) => (
                                    <AntDCard 
                                        key={item.travelId}
                                        item={item} 
                                        onClick={handleCardClick}                                
                                        isSelected={selectedItem && selectedItem.travelId === item.travelId} 
                                    />
                                ))}
                            </div>
                        )}
                        
                    </div>

                    {/* B. 우측 지도 영역 (요청에 따라 지도 스타일 적용) */}
                    <div className="lg:w-8/12">
                        <div className="relative border-2 border-gray-300 rounded-lg shadow-2xl h-[400px] lg:h-full lg:min-h-[1000px] sticky top-6 overflow-hidden"> 
                            {/* 지도 배경 시뮬레이션 */}
                            <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-xl text-gray-600 font-bold">
                                <span className="absolute inset-0 bg-map-pattern opacity-10"></span>
                                <span className="z-10">실시간 지도 영역</span>
                                
                                {selectedItem && (
                                    <div className="absolute z-20 p-3 rounded-lg bg-blue-600 text-white shadow-xl max-w-xs transition-all duration-500"
                                        style={{ 
                                            // 더미 위경도를 이용해 지도 위의 위치를 시뮬레이션
                                            // Mock 데이터가 없으므로 이 좌표 계산은 의미가 없을 수 있습니다.
                                            top: `${50 + (selectedItem.lat - 33.5) * 100}%`,
                                            left: `${50 + (selectedItem.lng - 126.75) * 100}%`,
                                            transform: 'translate(-50%, -100%)' 
                                        }}>
                                        <div className="font-bold text-lg leading-tight">{selectedItem.title}</div>
                                        <div className="text-xs mt-1">{selectedItem.address}</div>
                                        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-blue-600"></div>
                                    </div>
                                )}

                            </div>
                            
                            {!selectedItem && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                    <span className="text-white text-2xl font-semibold">
                                        목록에서 여행지를 선택하여 지도에서 위치를 확인하세요.
                                    </span>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* AntD Pagination 렌더링 */}
                {pageResult.totalPages > 1 && !hasError && (
                    <AntDPagination 
                        pageResult={pageResult} 
                        handlePageClick={handlePageClick} 
                        loading={loading}
                    />
                )}
            </div>
            
            {/* Tailwind Map Pattern을 위한 Style 정의 (옵션) */}
            <style jsx="true">{`
                .bg-map-pattern {
                    background-image: linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent);
                    background-size: 50px 50px;
                }
            `}</style>

        </MainLayout>
    );
};
export default TravelPage;