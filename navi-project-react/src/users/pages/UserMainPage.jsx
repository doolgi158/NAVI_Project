import { useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import { Button } from "antd";

const UserMainPage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      {/* Hero 배너 */}
      <div className="w-full h-[300px] bg-gradient-to-r from-sb-teal to-sb-gold rounded-2xl flex items-center justify-center text-black text-4xl font-bold mb-10">
        여행의 시작, NAVI ✈️

        <div>
          <Button onClick={() => navigate("/payments", { state: { keyword: "ACC" } })}>결제창</Button>
        </div> 
      </div>
    </MainLayout>
  );
};

export default UserMainPage;
