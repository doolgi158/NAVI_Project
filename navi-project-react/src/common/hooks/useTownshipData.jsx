// src/hooks/useTownshipData.js

import { useEffect, useState } from "react";
import axios from "axios";

// ✅ 최대 재시도 횟수 정의
const MAX_RETRIES = 5; 

/**
 * 읍면동 데이터를 불러오고 캐싱을 관리하는 커스텀 훅
 */
const useTownshipData = () => {
    const [townshipList, setTownshipList] = useState([]);
    const [retryCount, setRetryCount] = useState(0); // ✅ 재시도 횟수 상태 추가
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTownships = async () => {
        // ✅ 최대 재시도 횟수 초과 시 즉시 종료
        if (retryCount >= MAX_RETRIES) {
            console.error(`최대 재시도 횟수(${MAX_RETRIES}회) 초과. 읍면동 로드 중단.`);
            setIsLoading(false);
            setError("데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.");
            return;
        }

        try {
            const res = await axios.get("/api/townships");
            
            // 데이터가 성공적으로 로드되거나, 유효한 빈 응답을 받은 경우
            if (Array.isArray(res.data) && res.data.length >= 0) { 
                setTownshipList(res.data);
                sessionStorage.setItem("townshipList", JSON.stringify(res.data));
                setIsLoading(false);
                setRetryCount(0); // 성공했으니 카운트 초기화
                return;
            }

            // 배열이 아닌 유효하지 않은 응답일 경우 재시도
            console.warn(`⚠️ 유효하지 않은 응답 감지. 3초 후 재요청 시도 (현재 ${retryCount + 1}/${MAX_RETRIES})`);
            setRetryCount(prev => prev + 1);
            setTimeout(fetchTownships, 3000);

        } catch (err) {
            // 통신 실패(Error) 시 재시도
            console.error(`읍면동 로드 실패: ${err.message}. 2초 후 재요청 시도 (현재 ${retryCount + 1}/${MAX_RETRIES})`);
            
            setRetryCount(prev => prev + 1);
            setTimeout(fetchTownships, 2000);
        }
    };

    useEffect(() => {
        const cachedTownships = sessionStorage.getItem("townshipList");
        const parsedCache = cachedTownships ? JSON.parse(cachedTownships) : null;

        if (Array.isArray(parsedCache) && parsedCache.length > 0) {
            setTownshipList(parsedCache);
            setIsLoading(false);
        } else {
            fetchTownships();
        }
    }, []);

    return { townshipList, isLoading, error }; 
};

export default useTownshipData;