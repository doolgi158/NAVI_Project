import { useEffect, useMemo, useState } from "react";
import { Layout, Row, Col, Space, Typography, Segmented, Button, Spin } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import AdminSiderLayout from "../layout/AdminSiderLayout";

import KpiSection from "../../common/components/admin/KpiSection";
import UserChart from "../../common/components/admin/UserChart";
import SalesChart from "../../common/components/admin/SalesChart";
import UsageChart from "../../common/components/admin/UsageChart";
import PaymentPie from "../../common/components/admin/PaymentPie";
import Ranking from "../../common/components/admin/RankingTable";

import { MOCK_SUMMARY, MOCK_TREND_MONTHLY, MOCK_RANKINGS } from "../mockdata/dashboardMockData";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import { useDashboardData } from "@/common/hooks/admin/useDashboardData";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [range, setRange] = useState("월간");

  const endpoints = useMemo(() => [
    `${API_SERVER_HOST}/api/adm/userDashboard`,
    `${API_SERVER_HOST}/api/adm/travelDashboard`,
    `${API_SERVER_HOST}/api/adm/travelRanking`,
    `${API_SERVER_HOST}/api/adm/flightDashboard`,
    `${API_SERVER_HOST}/api/adm/accommodationDashboard`,
  ], []);

  const { data, loading, error, reload } = useDashboardData(endpoints);

  useEffect(() => {
    console.log("📊 Dashboard data:", data);
  }, [data]);

  // Hook 이후에 조건부 렌더링
  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <AdminSiderLayout />
        <div style={{ padding: 24 }}>
          <Spin fullscreen tip="Loading Dashboard..." />
        </div>
      </Layout>
    );
  }

  // 전월 대비 퍼센트 계산 함수
  const getPctChange = (curr, prev) => {
    if (!prev || prev === 0) return 0;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  };

  // 증감률 추가 계산
  const processedSummary = (() => {
    if (!data) return null;

    const users = data.users || {};
    const trend = data.userTrend || [];
    const prevMonth = trend.length > 1 ? trend[trend.length - 2] : null;
    const currMonth = trend.length > 0 ? trend[trend.length - 1] : null;

    // 백엔드 userTrend에는 total이 없으므로 users.total 기준으로만 계산
    const changedPct = getPctChange(users.total, users.total - (currMonth?.join || 0) + (currMonth?.leave || 0));

    return {
      ...data,
      users: {
        ...users,
        changedPct,
      },
    };
  })();


  // 차트용 데이터
  const trend = data?.userTrend || [];
  const displayTrend = {
    salesTrend: MOCK_TREND_MONTHLY.salesTrend,
    paymentShare: MOCK_TREND_MONTHLY.paymentShare,
  };

  // 인기 여행지 TOP5
  const travelTop5 =
    (data?.ranking || [])
      .slice(0, 5)
      .map((t, i) => ({
        rank: i + 1,
        title: t.title,
        id: t.id || "-",
        score: t.score || t.views + t.likes + t.bookmarks,
        region: t.region || "-",
      })) || [];

  // 숙소 TOP5 (아직 더미)
  const accommodationTop5 = [
    { rank: 1, name: "부산 해운대호텔", city: "부산", reservations: 380, rating: 4.8 },
    { rank: 2, name: "서울 프리미어호텔", city: "서울", reservations: 290, rating: 4.7 },
    { rank: 3, name: "제주 블루힐", city: "제주", reservations: 240, rating: 4.6 },
    { rank: 4, name: "속초 선샤인", city: "속초", reservations: 210, rating: 4.5 },
    { rank: 5, name: "경주 더파크", city: "경주", reservations: 180, rating: 4.5 },
  ];

  const displayRanking = MOCK_RANKINGS;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSiderLayout />
      <div style={{ padding: 24 }}>
        {/* 상단 헤더 */}
        <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3}>관리자 대시보드</Title>
            <Text type="secondary">전체 서비스 지표 요약</Text>
          </Col>
          <Col>
            <Space>
              <Segmented
                options={["일간", "주간", "월간"]}
                value={range}
                onChange={setRange}
              />
              <Button icon={<ReloadOutlined />} onClick={reload}>
                새로고침
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 로딩 중 */}
        {loading && (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Spin tip="데이터 불러오는 중..." />
          </div>
        )}

        {/* KPI 섹션 */}
        {!loading && <KpiSection summary={processedSummary} loading={loading} />}

        {/* 차트 섹션 */}
        {!loading && trend.length > 0 && (
          <>
            <div style={{ height: 24 }} />

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <UserChart
                  data={trend.map((item) => ({
                    name: item.month,
                    join: item.join,
                    leave: item.leave,
                    active: item.active,
                  }))}
                />
              </Col>
              <Col xs={24} lg={12}>
                <SalesChart data={displayTrend.salesTrend} />
              </Col>
            </Row>

            <div style={{ height: 24 }} />

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <UsageChart data={displayTrend.usageTrend} />
              </Col>
              <Col xs={24} lg={12}>
                <PaymentPie data={displayTrend.paymentShare} />
              </Col>
            </Row>

            <div style={{ height: 24 }} />


            {/* 인기 여행지 & 숙소 섹션 */}
            <Ranking
              summary={processedSummary}
              ranking={{ travels: travelTop5, accommodations: accommodationTop5 }}
            />
          </>
        )}

        {/* 에러 메시지 */}
        {error && (
          <p style={{ color: "red", marginTop: 20 }}>
            🚨 데이터 불러오기 실패: {error}
          </p>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;