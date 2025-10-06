import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MainLayout from '../../layout/MainLayout.jsx';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom'; 


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
            {/* {item.thumbnailPath} */}
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
    // useNavigate 훅을 사용하여 navigate 함수 초기화
    const navigate = useNavigate(); 
    
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

    // ⭐️ 지도 SDK 로드 완료 상태를 추적하는 새 상태 ⭐️
    const [isMapSDKLoaded, setIsMapSDKLoaded] = useState(false); 

    // 지도 객체를 저장할 Ref
    const mapRef = useRef(null);
    const markerRef = useRef(null); 
    const infoWindowRef = useRef(null);

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

    // ✅ 카드 클릭 시 상세 정보 설정 및 페이지 이동
    const handleCardClick = (item) => {
        setSelectedItem(item);
        // travelId를 이용해 상세 페이지로 이동
        navigate(`/travel/detail/${item.travelId}`); 
    };

     // =========================================================================
    // ⭐️ 지도 로직 수정 영역 ⭐️
    // =========================================================================
    
    // 1. [수정 1] 지도 SDK를 활성화하고 isMapSDKLoaded 상태를 업데이트합니다.
    useEffect(() => {
        const loadKakaoMap = () => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        console.log("✅ Kakao Maps SDK 로드 완료");
        setIsMapSDKLoaded(true);
      });
    } else {
      console.warn("⚠️ Kakao SDK가 아직 로드되지 않음");
    }
  };

  // script가 이미 존재하는 경우
  if (window.kakao && window.kakao.maps) {
    loadKakaoMap();
  } else {
    const script = document.createElement("script");
    script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=64f77515cbf4b9bf257e664e44b1ab9b&libraries=services&autoload=false";
    script.async = true;
    script.onload = loadKakaoMap;
    document.head.appendChild(script);
  }
}, []);

    
    // 2. [수정 2] selectedItem과 isMapSDKLoaded 상태가 변경될 때마다 지도를 업데이트합니다.
    useEffect(() => {
  if (!isMapSDKLoaded || !selectedItem) return;

  // DOM 렌더 이후 실행 (렌더 타이밍 보장)
  setTimeout(() => {
    const mapContainer = document.getElementById("kakao-map-container");
    if (!mapContainer) {
      console.error("지도 컨테이너를 찾을 수 없습니다.");
      return;
    }

    const maps = window.kakao.maps;
    const mapOption = {
      center: new maps.LatLng(33.450701, 126.570667),
      level: 8,
    };
    const map = new maps.Map(mapContainer, mapOption);
    mapRef.current = map;

    // 주소 좌표 검색 로직
    const geocoder = new maps.services.Geocoder();
    geocoder.addressSearch(selectedItem.address, (result, status) => {
      let coords;
      if (status === maps.services.Status.OK && result[0]) {
        coords = new maps.LatLng(result[0].y, result[0].x);
      } else {
        coords = new maps.LatLng(33.450701, 126.570667);
      }

      const marker = new maps.Marker({ map, position: coords });
      const infowindow = new maps.InfoWindow({ content: `<div>${selectedItem.title}</div>` });
      infowindow.open(map, marker);

      setTimeout(() => {
        map.relayout();
        map.setCenter(coords);
      }, 300);
    });
  }, 100); // 100ms 지연
}, [isMapSDKLoaded, selectedItem]); // isMapSDKLoaded를 종속성 배열에 추가

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

                    {/* B. 우측 지도 영역 (카카오맵으로 교체) */}
                    <div className="lg:w-8/12">
                        <div className="relative border-2 border-gray-300 rounded-lg shadow-2xl h-[500px] sticky top-6 overflow-hidden"> 
                            
                            {/* ⭐️ 카카오맵이 렌더링될 실제 컨테이너 ⭐️ */}
                            <div 
                                id="kakao-map-container" 
                                style={{ width: '100%', height: '100%',display: "block" }}
                            >
                                {/* 선택된 항목이 없을 때 가이드 메시지 */}
                                {!selectedItem && (
                                     <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
                                         <span className="text-white text-2xl font-semibold p-4 text-center">
                                             목록에서 여행지를 선택하여<br/> 지도에서 위치를 확인하세요.
                                         </span>
                                     </div>
                                )}
                                
                                {/* ⚠️ 지도 로드 실패/지연 시 메시지 ⚠️ */}
                                {!isMapSDKLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                                        <div className="text-gray-600 text-lg font-medium">
                                            카카오맵 SDK 로딩 중...
                                        </div>
                                    </div>
                                )}
                            </div>
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
            
           

        </MainLayout>
    );
};
export default TravelPage;