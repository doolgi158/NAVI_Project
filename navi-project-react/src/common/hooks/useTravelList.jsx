import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../common/api/naviApi.js';
import { useTravelListFilter } from './useTravelListFilter.jsx';

// ✅ 카테고리 목록 정의
const categories = ['전체', '관광지', '음식점', '쇼핑'];

// ✅ 여행지 목록 API 호출 함수
const getTravelData = async (domain, pageParam, filterQuery, userId) => {
  const apiUrl = `/${domain}`;
  const sortArray = pageParam.sort ? pageParam.sort.split(',') : [];
  const sortParams = [];

  for (let i = 0; i < sortArray.length; i += 2) {
    if (i + 1 < sortArray.length) sortParams.push(`${sortArray[i]},${sortArray[i + 1]}`);
  }

  let queryString = `?page=${pageParam.page - 1}&size=${pageParam.size}`;
  queryString += sortParams.map((s) => `&sort=${s}`).join('');

  if (filterQuery.region2Name?.length > 0) {
    const encodedRegions = filterQuery.region2Name.map(encodeURIComponent).join(',');
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

  // ✅ 로그인 사용자가 있다면 쿼리 파라미터로 id 전달
  try {
    const response = await api.get(apiUrl + queryString);
    return response.data;
  } catch (error) {
    console.error('여행지 목록 로딩 실패:', error.message);
    throw error;
  }
};

export const useTravelList = (userId) => {
  // ⭐ 새로고침 시 세션 초기화
  const navType = performance?.getEntriesByType('navigation')?.[0]?.type;
  if (navType === 'reload') {
    sessionStorage.removeItem('travelListSort');
    sessionStorage.removeItem('travelListCategory');
    sessionStorage.removeItem('travelListSearch');
    sessionStorage.removeItem('travelListPage');
  }

  // ✅ 세션 저장된 상태 복원
  const getInitialParams = () => {
    const savedPage = sessionStorage.getItem('travelListPage');
    const savedSort = sessionStorage.getItem('travelListSort');
    const savedCategory = sessionStorage.getItem('travelListCategory');
    const savedSearch = sessionStorage.getItem('travelListSearch');

    return {
      page: savedPage ? parseInt(savedPage, 10) : 1,
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

  const initialParams = getInitialParams();
  const [pageParam, setPageParam] = useState({
    page: initialParams.page,
    size: 10,
    sort: initialParams.sort,
    categoryName: initialParams.categoryName,
    search: initialParams.search,
  });

  const isLoadingRef = useRef(false);
  const [showLoading, setShowLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  // ✅ 지역 필터 훅
  const regionFilterProps = useTravelListFilter((newRegions) => {
    setPageParam((prev) => ({ ...prev, page: 1 }));
  });

  // ✅ 여행지 목록 불러오기
  const fetchTravelList = useCallback(
    (param, query) => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      setShowLoading(true);
      setHasError(false);

      getTravelData('travel', param, query, userId)
        .then((data) => {
          const fetchedList = data.content || [];
          const pageInfo = data.page || {}; // 추가

          const currentPage = (pageInfo.number || 0) + 1; // 수정
          const totalPages = pageInfo.totalPages || 1;  // 추가
          const totalElements = pageInfo.totalElements || 0;  // 추가

          const startBlock = Math.floor((currentPage - 1) / 10) * 10 + 1; // 수정
          const endBlock = Math.min(totalPages, startBlock + 9);  // 수정
          const pageList = Array.from({ length: endBlock - startBlock + 1 }, (_, i) => startBlock + i);

          setPageResult({
            dtoList: fetchedList,
            totalElements,
            totalPages,
            page: currentPage,
            size: pageInfo.size || 10, // 수정
            startPage: startBlock,
            endPage: endBlock,
            pageList,
          });

          setSelectedItem((prev) => {
            const existsInNewList = prev
              ? fetchedList.some((it) => it.travelId === prev.travelId)
              : false;
            return !prev || !existsInNewList ? fetchedList[0] || null : prev;
          });
          setHoveredItem(null);
        })
        .catch((e) => {
          console.error("❌ [API 호출 실패]", e);
          setHasError(true)
        })
        .finally(() => {
          isLoadingRef.current = false;
          setShowLoading(false);
        });
    },
    [userId]
  );

  useEffect(() => {
    fetchTravelList(pageParam, regionFilterProps.filterQuery);
  }, [pageParam, regionFilterProps.filterQuery, userId, fetchTravelList]);

  // ✅ 페이지 클릭
  const handlePageClick = useCallback(
    (pageNumber) => {
      if (!showLoading && pageNumber > 0 && pageNumber <= pageResult.totalPages) {
        sessionStorage.setItem('travelListPage', pageNumber);
        setPageParam((prev) => ({ ...prev, page: pageNumber }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [showLoading, pageResult.totalPages]
  );

  const handleSortChange = useCallback((sortType) => {
    if (!sortType) return;
    const newSort = `${sortType},contentsCd,asc`;
    sessionStorage.setItem('travelListSort', newSort);
    setPageParam((prev) => ({ ...prev, page: 1, sort: newSort }));
    sessionStorage.removeItem('travelListPage');
  }, []);

  const handleCategoryChange = useCallback((categoryName) => {
    sessionStorage.setItem('travelListCategory', categoryName);
    setPageParam((prev) => ({ ...prev, page: 1, categoryName }));
  }, []);

  const handleSearch = useCallback((searchTerm) => {
    sessionStorage.setItem('travelListSearch', searchTerm);
    setPageParam((prev) => ({ ...prev, page: 1, search: searchTerm }));
  }, []);

  const getActiveSort = () => {
    const currentSort = pageParam.sort || '';
    if (currentSort.includes('likesCount,desc')) return 'likesCount,desc';
    if (currentSort.includes('views,desc')) return 'views,desc';
    return 'updatedAt,desc';
  };

  const loadTravelList = useCallback(() => {
    fetchTravelList(pageParam, regionFilterProps.filterQuery);
  }, [fetchTravelList, pageParam, regionFilterProps.filterQuery]);

  return {
    pageResult,
    pageParam,
    showLoading,
    hasError,
    selectedItem,
    hoveredItem,
    categories,
    activeCategory: pageParam.categoryName,
    handlePageClick,
    handleSortChange,
    handleCategoryChange,
    handleSearch,
    setSelectedItem,
    setHoveredItem,
    getActiveSort: getActiveSort(),
    loadTravelList,
    ...regionFilterProps,
  };
};
