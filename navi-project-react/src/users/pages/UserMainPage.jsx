import MainLayout from "../layout/MainLayout";

const UserMainPage = () => {
  return (
    <MainLayout>
      {/* Hero 배너 */}
      <div className="w-full h-[300px] bg-gradient-to-r from-sb-teal to-sb-gold rounded-2xl flex items-center justify-center text-white text-4xl font-bold mb-10">
        여행의 시작, NAVI ✈️
      </div>
    </MainLayout>
  );
};

export default UserMainPage;
