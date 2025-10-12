import MainLayout from "../../layout/MainLayout";
import FindUserPw from "../../../common/components/login/FindUserPw";

const FindUserPwPage = () => {
  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBEA]">
        <div className="w-full max-w-md bg-white shadow-lg rounded-3xl p-10 border border-gray-100">
          {/* 제목 */}
          <div className="flex items-center justify-center mb-8">
            <span className="text-3xl mr-2">🔑</span>
            <h2 className="text-3xl font-extrabold text-gray-900">
              비밀번호 찾기
            </h2>
          </div>

          {/* 비밀번호 찾기 폼 */}
          <FindUserPw />

          {/* 하단 안내 */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>아이디가 기억나지 않으신가요?</p>
            <a
              href="/users/find-id"
              className="font-semibold text-[#4A9E8C] hover:underline"
            >
              아이디 찾기
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FindUserPwPage;