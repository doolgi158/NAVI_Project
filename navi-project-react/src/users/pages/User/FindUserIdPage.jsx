import { useState } from "react";
import FindUserId from "../../../common/components/Login/FindUserId";
import MainLayout from "../../layout/MainLayout";

const FindUserIdPage = () => {
  const [result, setResult] = useState("");

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBEA]">
        <div className="w-full max-w-md bg-white shadow-lg rounded-3xl p-10 border border-gray-100">
          <div className="flex items-center justify-center mb-8">
            <span className="text-3xl mr-2">🔍</span>
            <h2 className="text-3xl font-extrabold text-gray-900">아이디 찾기</h2>
          </div>

          <FindUserId onResult={setResult} />

          {result && (
            <div className="mt-6 p-4 rounded-lg bg-[#E8F6F2] text-center border border-[#4A9E8C]/30">
              <p className="text-[#317768] font-semibold whitespace-pre-line">{result}</p>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>아직 회원이 아니신가요?</p>
            <a
              href="/users/signup"
              className="font-semibold text-[#4A9E8C] hover:underline"
            >
              회원가입 하기
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FindUserIdPage;
