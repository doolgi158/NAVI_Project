import { useEffect, useMemo, useState } from "react";
import { Layout, Row, Col, Space, Typography, Segmented, Button, Spin, message } from "antd";
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
  const range = "월간";

  // API endpoints (range 변경 시마다 갱신)
  const endpoints = useMemo(() => {
    return [
      `${API_SERVER_HOST}/api/adm/userDashboard`,
      `${API_SERVER_HOST}/api/adm/travelDashboard`,
      `${API_SERVER_HOST}/api/adm/travelRanking`,
      `${API_SERVER_HOST}/api/adm/flightDashboard`,
      `${API_SERVER_HOST}/api/adm/accommodation/dashboard`,
      `${API_SERVER_HOST}/api/adm/accommodation/ranking`,
      `${API_SERVER_HOST}/api/adm/usageDashboard`,
      `${API_SERVER_HOST}/api/adm/userTrend`,
      `${API_SERVER_HOST}/api/adm/paymentDashboard`,
      `${API_SERVER_HOST}/api/adm/paymentShare`,
    ];
  }, []);

  const { data, loading, error, reload } = useDashboardData(endpoints);

  useEffect(() => {
    console.log("📊 Dashboard data:", data);
  }, [data]);

  // KPI 계산
  const getPctChange = (curr, prev) => {
    if (!prev || prev === 0) return 0;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  };

  // KPI Summary 가공
  const processedSummary = (() => {
    if (!data) return null;

    const users = data.users || {};
    const trend = data.userTrend || [];
    const prevMonth = trend.length > 1 ? trend[trend.length - 2] : null;
    const currMonth = trend.length > 0 ? trend[trend.length - 1] : null;
    const changedPct = getPctChange(users.total, users.total - (currMonth?.join || 0) + (currMonth?.leave || 0));

    return {
      ...data,
      users: { ...users, changedPct },
    };
  })();

  // 인기 여행지 / 숙소 TOP5
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

  const accommodationTop5 =
    (data?.accommodationRanking || [])
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map((acc, i) => ({
        rank: i + 1,
        id: acc.id || "-",
        name: acc.name || acc.title || "이름 없음",
        region: acc.region || acc.city || "-",
        views: acc.views || 0,
      })) || [];

  // 로딩 중 화면
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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSiderLayout />
      <div style={{ padding: 24 }}>
        {/* 헤더 */}
        <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3}>관리자 대시보드</Title>
            <Text type="secondary">{range} 기준 서비스 지표 요약</Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={reload}>
                새로고침
              </Button>
            </Space>
          </Col>
        </Row>

        {/* KPI */}
        <KpiSection summary={processedSummary} loading={loading} />

        {/* 차트 섹션 */}
        <div style={{ height: 24 }} />
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <UserChart
              data={(data?.userTrend || []).map((item) => ({
                name: item.period || item.name || "-",
                join: item.join || 0,
                leave: item.leave || 0,
                active: item.active || 0,
              }))}
            />
          </Col>
          <Col xs={24} lg={12}>
            <SalesChart data={data?.paymentsTrend || []} />
          </Col>
        </Row>

        <div style={{ height: 24 }} />
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <UsageChart data={data?.usageTrend || []} />
          </Col>
          <Col xs={24} lg={12}>
            <PaymentPie data={data?.paymentShare || []} />
          </Col>
        </Row>

        <div style={{ height: 24 }} />
        <Ranking
          summary={processedSummary}
          ranking={{
            travels: travelTop5,
            accommodations: accommodationTop5,
          }}
        />

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