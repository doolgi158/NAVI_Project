import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useTravelListFilter } from './useTravelListFilter.jsx'; // 지역 필터 훅 임포트

const categories = ['전체', '관광지', '음식점', '쇼핑'];

//여행지 목록 API 호출 함수 (생략)
const getTravelData = async (domain, pageParam, filterQuery) => {
    const apiUrl = `/api/${domain}`;
    
    const sortArray = pageParam.sort ? pageParam.sort.split(',') : []; 
    const sortParams = [];
    // API에 전달할 정렬 필드를 쌍(field, direction)으로 구성
    for (let i = 0; i < sortArray.length; i += 2) {
        if (i + 1 < sortArray.length) {
            sortParams.push(`${sortArray[i]},${sortArray[i+1]}`);
        }
    }
    
    let queryString = `?page=${pageParam.page - 1}&size=${pageParam.size}`;
    queryString += sortParams.map(s => `&sort=${s}`).join('');

    if (filterQuery.region2Name && filterQuery.region2Name.length > 0) {
        const encodedRegions = filterQuery.region2Name.map(region => encodeURIComponent(region)).join(',');
        queryString += `&region2Name=${encodedRegions}`;
    }
    
    if (pageParam.categoryName && pageParam.categoryName !== '전체') {
        const encodedCategoryName = encodeURIComponent(pageParam.categoryName);
        queryString += `&categoryName=${encodedCategoryName}`;
    }
    
    if (pageParam.search) {
        const encodedSearch = encodeURIComponent(pageParam.search);
        queryString += `&search=${encodedSearch}`;
    }


    try {
        const response = await axios.get(apiUrl + queryString); 
        return response.data;
    } catch (error) {
        console.error('여행지 목록 로딩 실패:', error.message);
        throw error;
    }
};


export const useTravelList = () => {
    //  세션 스토리지에서 모든 pageParam 관련 상태를 복원하도록 수정
    const getInitialParams = () => {
        const savedPage = sessionStorage.getItem('travelListPage');
        const savedSort = sessionStorage.getItem('travelListSort'); 
        const savedCategory = sessionStorage.getItem('travelListCategory'); // 카테고리 복원
        const savedSearch = sessionStorage.getItem('travelListSearch'); // 검색어 복원
        
        return {
            page: savedPage ? parseInt(savedPage, 10) : 1,
            // ⭐️ 저장된 값이 없으면 'updatedAt,desc,contentsCd,asc'를 기본값으로 사용합니다.
            sort: savedSort || 'updatedAt,desc,contentsCd,asc', 
            categoryName: savedCategory || categories[0],
            search: savedSearch || '',
        };
    };

    const [pageResult, setPageResult] = useState({
        dtoList: [],
        totalElements: 0,
        totalPages: 0,
        page: 1,
        size: 10,
        startPage: 1,
        endPage: 1,
        pageList: [],
    });
    
    // pageParam 초기값 설정 (검색어 필드 포함)
    const initialParams = getInitialParams();
    const [pageParam, setPageParam] = useState({ 
        page: initialParams.page, 
        size: 10,
        sort: initialParams.sort, 
        categoryName: initialParams.categoryName, 
        search: initialParams.search 
    });
    
    const isLoadingRef = useRef(false);
    const [showLoading, setShowLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [hoveredItem, setHoveredItem] = useState(null);

    // 지역 필터 변경 시 pageParam 업데이트 로직
    const handleRegionFilterChange = useCallback((newRegions) => {
        setPageParam(prev => ({ ...prev, page: 1 }));
        // 참고: 필터 변경 시 정렬은 유지됩니다.
    }, []);

    // 지역 필터 훅 사용
    const regionFilterProps = useTravelListFilter(handleRegionFilterChange);
    

    // 여행지 목록 불러오기 (생략)
    const fetchTravelList = useCallback((param, query) => {
        if (isLoadingRef.current) return; 

        isLoadingRef.current = true;
        setShowLoading(true);
        setHasError(false);

        // API 호출 시 filterQuery를 사용합니다.
        getTravelData('travel', param, query) 
            .then((data) => {
                let fetchedList = data.content || [];
                
                const currentPage = data.number + 1;
                const startBlock = Math.floor(data.number / 10) * 10 + 1;
                const endBlock = Math.min(data.totalPages, startBlock + 9);
                const pageList = Array.from({ length: endBlock - startBlock + 1 }, (_, i) => startBlock + i);

                setPageResult({
                    dtoList: fetchedList, 
                    totalElements: data.totalElements, 
                    totalPages: data.totalPages,
                    page: currentPage,
                    size: data.size,
                    startPage: startBlock,
                    endPage: endBlock,
                    pageList,
                });

                // 선택된 항목(selectedItem)이 없거나 새 목록에 없을 경우에만 
                // 새 목록의 첫 번째 항목을 지도 표시를 위해 선택
                setSelectedItem((prev) => {
                    const existsInNewList = prev ? fetchedList.some((it) => it.travelId === prev.travelId) : false;
                    
                    if (!prev || !existsInNewList) { 
                        return fetchedList[0] || null;
                    }
                    return prev;
                });
                
                setHoveredItem(null); 
            })
            .catch(() => {
                setHasError(true); 
            })
            .finally(() => {
                isLoadingRef.current = false;
                setShowLoading(false); 
            });
    }, []); 

    useEffect(() => {
        fetchTravelList(pageParam, regionFilterProps.filterQuery); 
    }, [pageParam, regionFilterProps.filterQuery, fetchTravelList]); 
    
    // 페이지 클릭 핸들러 (생략)
    const handlePageClick = useCallback((pageNumber) => {
        if (!showLoading && pageNumber > 0 && pageNumber <= pageResult.totalPages) {
            sessionStorage.setItem('travelListPage', pageNumber);
            setPageParam((prev) => ({ ...prev, page: pageNumber }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [showLoading, pageResult.totalPages]);

    // 정렬 변경 핸들러 함수
    const handleSortChange = useCallback((sortType) => {
        // sortType이 항상 'updatedAt,desc', 'likes,desc', 'views,desc' 중 하나라고 가정합니다.
        // sortType이 전달되지 않으면 (예: 필터 초기화 시) 기존 정렬을 유지합니다.
        if (!sortType) return; // 정렬 유형이 명시되지 않으면 아무것도 하지 않고 종료
        
        // ⭐️ 수정된 로직: sortType이 있을 때만 newSort를 구성하고 저장합니다.
        const newSort = `${sortType},contentsCd,asc`;
        
        // 정렬 상태를 세션 스토리지에 저장
        sessionStorage.setItem('travelListSort', newSort); 
        // 정렬 변경 시, 페이지는 1로 초기화하고, 페이지 저장 값은 제거합니다.
        setPageParam((prev) => ({ ...prev, page: 1, sort: newSort }));
        sessionStorage.removeItem('travelListPage'); 
    }, []);

    // 카테고리 변경 핸들러 (생략)
    const handleCategoryChange = useCallback((categoryName) => {
        // 카테고리 상태 저장
        sessionStorage.setItem('travelListCategory', categoryName);
        setPageParam((prev) => ({ ...prev, page: 1, categoryName: categoryName }));
    }, []);
    
    //  검색 실행 핸들러 (생략)
    const handleSearch = useCallback((searchTerm) => {
        // 검색어 상태 저장
        sessionStorage.setItem('travelListSearch', searchTerm);
        setPageParam(prev => ({ 
            ...prev, 
            page: 1,
            search: searchTerm, 
        }));
    }, []);
    
    // 정렬 속성 추출 (UI 표시용) (생략)
    const getActiveSort = () => {
        const currentSort = pageParam.sort || ''; 
        
        if (currentSort.includes('likesCount,desc')) return 'likesCount,desc';
        if (currentSort.includes('views,desc')) return 'views,desc';
        
        if (currentSort.includes('updatedAt,desc')) return 'updatedAt,desc';
        
        return 'updatedAt,desc'; 
    };
    
    const loadTravelList = useCallback(() => {
        fetchTravelList(pageParam, regionFilterProps.filterQuery);
    }, [fetchTravelList, pageParam, regionFilterProps.filterQuery]); 


    return {
        // 데이터 및 상태
        pageResult,
        pageParam,
        showLoading,
        hasError,
        selectedItem,
        hoveredItem,
        categories,

        // 현재 선택된 카테고리 값을 UI에 전달
        activeCategory: pageParam.categoryName,

        // 핸들러
        handlePageClick,
        handleSortChange,
        handleCategoryChange,
        handleSearch, 
        setSelectedItem,
        setHoveredItem,
        getActiveSort: getActiveSort(), 
        loadTravelList, 

        // 지역 필터 props 통째로 전달
        ...regionFilterProps
    };
};