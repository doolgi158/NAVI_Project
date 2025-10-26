import { useEffect, useState } from "react";

const HeroSection = () => {
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        let cycleTimer;

        const startCycle = () => {
            setShowText(false); // 초기 배너 상태
            const showTimer = setTimeout(() => setShowText(true), 5000);   // 5초 후 슬로건 표시
            const hideTimer = setTimeout(() => setShowText(false), 11000); // 11초 후 숨김
            cycleTimer = setTimeout(startCycle, 12000);                    // 12초마다 반복

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
                clearTimeout(cycleTimer);
            };
        };

        const cleanup = startCycle();
        return () => {
            cleanup?.();
            clearTimeout(cycleTimer);
        };
    }, []);

    return (
        <div
            className="w-full h-[420px] rounded-2xl mb-10 relative overflow-hidden transition-all duration-700"
            style={{
                backgroundImage: `url('/src/users/images/hawaii-panorama-photo-l.jpg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* 어두운 오버레이 */}
            <div
                className={`absolute inset-0 transition-all duration-1000 ${showText ? "bg-black/40 backdrop-blur-[2px]" : "bg-black/10 backdrop-blur-0"
                    }`}
            />

            {/* 중앙 슬로건 */}
            <div
                className={`absolute inset-0 flex flex-col items-center justify-center text-center text-white transition-opacity duration-1000 ease-in-out ${showText ? "opacity-100" : "opacity-0"
                    }`}
            >
                <h1 className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-lg">
                    여행의 시작, NAVI ✈️
                </h1>
                <p className="text-lg opacity-90">당신의 다음 여정을 지금 찾아보세요</p>
            </div>
        </div>
    );
};

export default HeroSection;