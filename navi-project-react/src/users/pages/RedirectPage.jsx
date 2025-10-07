import { useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useSocialLogin } from "../hooks/useSocialLogin";

const RedirectPage = () => {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const { handleRedirect } = useSocialLogin();

  useEffect(() => {
    if (code && provider) {
      handleRedirect(provider, code);
    }
  }, [code, provider]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-600">로그인 처리 중...</h2>
      <p className="text-sm text-gray-400">잠시만 기다려주세요.</p>
    </div>
  );
};

export default RedirectPage;