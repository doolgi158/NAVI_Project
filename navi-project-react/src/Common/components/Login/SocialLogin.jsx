const SocialLoginButton = ({ provider }) => {
    // 환경 변수에서 클라이언트 ID 가져오기
    const CLIENT_IDS = {
        google: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        kakao: import.meta.env.VITE_KAKAO_CLIENT_ID,
        naver: import.meta.env.VITE_NAVER_CLIENT_ID,
    };

    // 리다이렉트 URI 설정 (프론트엔드 주소)
    const REDIRECT_URIS = {
        google: "http://localhost:3000/oauth2/redirect",
        kakao: "http://localhost:3000/oauth2/redirect",
        naver: "http://localhost:3000/oauth2/redirect",
    };

    // 각 소셜 로그인 URL
    const AUTH_URLS = {
        google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_IDS.google}&redirect_uri=${REDIRECT_URIS.google}&response_type=code&scope=openid%20email%20profile`,
        kakao: `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_IDS.kakao}&redirect_uri=${REDIRECT_URIS.kakao}&response_type=code`,
        naver: `https://nid.naver.com/oauth2.0/authorize?client_id=${CLIENT_IDS.naver}&redirect_uri=${REDIRECT_URIS.naver}&response_type=code&state=naviState`,
    };

    // 버튼 클릭 시 해당 소셜 로그인 페이지로 리다이렉트
    const handleClick = () => {
        window.location.href = AUTH_URLS[provider];
  };

    // 버튼 스타일 및 라벨
    const buttonStyle = {
        google: "bg-white border text-gray-700 hover:bg-gray-100",
        kakao: "bg-[#FEE500] text-black hover:bg-[#FDD835]",
        naver: "bg-[#03C75A] text-white hover:bg-[#02A94D]",
    };

    // 버튼 라벨
    const label = {
        google: "Google로 로그인",
        kakao: "카카오로 로그인",
        naver: "네이버로 로그인",
    };

    // 버튼 렌더링
    return (
        <button
        type = "button"
        onClick={handleClick}
        className={`w-full py-3 rounded-xl font-semibold shadow-md transition ${buttonStyle[provider]}`}
        >
            {label[provider]}
        </button>
    );
};

export default SocialLoginButton;
