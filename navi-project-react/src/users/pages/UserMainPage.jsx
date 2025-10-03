import MainLayout from "../layout/MainLayout";
import { Card, Button } from "antd";

const UserMainPage = () => {
  return (
    <MainLayout>
      {/* Hero 배너 */}
      <div className="w-full h-[300px] bg-gradient-to-r from-sb-teal to-sb-gold rounded-2xl flex items-center justify-center text-white text-4xl font-bold mb-10">
        여행의 시작, NAVI ✈️
      </div>

      {/* 추천 여행 섹션 */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">추천 여행</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            hoverable
            cover={
              <img
                alt="여행지1"
                src="https://picsum.photos/400/200?random=1"
                className="rounded-t-xl"
              />
            }
          >
            <Card.Meta title="제주도 여행" description="푸른 바다와 한라산" />
            <Button type="primary" className="mt-4 w-full">
              자세히 보기
            </Button>
          </Card>

          <Card
            hoverable
            cover={
              <img
                alt="여행지2"
                src="https://picsum.photos/400/200?random=2"
                className="rounded-t-xl"
              />
            }
          >
            <Card.Meta title="부산 투어" description="광안리와 해운대" />
            <Button type="primary" className="mt-4 w-full">
              자세히 보기
            </Button>
          </Card>

          <Card
            hoverable
            cover={
              <img
                alt="여행지3"
                src="https://picsum.photos/400/200?random=3"
                className="rounded-t-xl"
              />
            }
          >
            <Card.Meta title="강릉 여행" description="커피와 바다" />
            <Button type="primary" className="mt-4 w-full">
              자세히 보기
            </Button>
          </Card>
        </div>
      </section>

      {/* 하단 설명 */}
      <div className="mt-12 text-center text-gray-600 text-sm">
        NAVI는 여러분의 여행을 더욱 특별하게 만들어드립니다.  
      </div>
    </MainLayout>
  );
};

export default UserMainPage;
