import { Layout, Card, Row, Col } from "antd";
import { Line } from "@ant-design/charts";
import AdminSiderLayout from "../layout/AdminSiderLayout";

const { Header, Content } = Layout;

const AdminDashboardPage = () => {
  // 더미 데이터 (테스트용)
  const data = [
    { month: "1월", users: 20 },
    { month: "2월", users: 40 },
    { month: "3월", users: 35 },
    { month: "4월", users: 60 },
    { month: "5월", users: 70 },
  ];

  const config = {
    data,
    xField: "month",
    yField: "users",
    smooth: true,
    height: 300,
  };

  return (
    <Layout className="min-h-screen">
      {/* 사이드바 */}
      <AdminSiderLayout />

      <Layout>
        {/* 상단 헤더 */}
        <Header className="bg-white px-6 shadow flex items-center text-xl font-bold">
          메인 페이지
        </Header>

        {/* 메인 콘텐츠 */}
        <Content className="p-6">
          {/* 이용자 추이 */}
          <Card title="이용자 추이" className="mb-6 shadow rounded-xl">
            <Line {...config} />
          </Card>

          {/* 통계 카드 */}
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card className="text-center shadow">이용자 수</Card>
            </Col>
            <Col span={6}>
              <Card className="text-center shadow">탈퇴 회원 수</Card>
            </Col>
            <Col span={6}>
              <Card className="text-center shadow">여행 계획 수</Card>
            </Col>
            <Col span={6}>
              <Card className="text-center shadow">여행지 수</Card>
            </Col>
            <Col span={6}>
              <Card className="text-center shadow">숙소 수</Card>
            </Col>
            <Col span={6}>
              <Card className="text-center shadow">항공편 수</Card>
            </Col>
            <Col span={6}>
              <Card className="text-center shadow">결제 건수</Card>
            </Col>
            <Col span={6}>
              <Card className="text-center shadow">결제 취소 수</Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboardPage;