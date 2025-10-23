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
import { generatePeriods } from "@/common/util/dateFormat";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [range, setRange] = useState("월간");

  // API endpoints (range 변경 시마다 갱신)
  const endpoints = useMemo(() => {
    const rangeParam =
      range === "일간" ? "daily" :
        range === "주간" ? "weekly" : "monthly";

    return [
      `${API_SERVER_HOST}/api/adm/userDashboard?range=${rangeParam}`,
      `${API_SERVER_HOST}/api/adm/travelDashboard?range=${rangeParam}`,
      `${API_SERVER_HOST}/api/adm/travelRanking?range=${rangeParam}`,
      `${API_SERVER_HOST}/api/adm/flightDashboard?range=${rangeParam}`,
      `${API_SERVER_HOST}/api/adm/accommodationDashboard?range=${rangeParam}`,
      `${API_SERVER_HOST}/api/adm/accommodationRanking?range=${rangeParam}`,
      `${API_SERVER_HOST}/api/adm/usageDashboard?range=${rangeParam}`,
    ];
  }, [range]);

  const { data, loading, error, reload } = useDashboardData(endpoints);

  useEffect(() => {
    console.log("📊 Dashboard data:", data);
  }, [data, range]);

  // range에 맞는 기간별 usageTrend 보완
  const displayTrend = useMemo(() => {
    const rangeParam =
      range === "일간" ? "daily" :
        range === "주간" ? "weekly" : "monthly";

    const trendPeriods = generatePeriods(rangeParam);

    const usageTrend = trendPeriods.map((p) => {
      const found = data?.usageTrend?.find((d) => d.name === p);
      return {
        name: p,
        travelViews: found?.travelViews || 0,
        accViews: found?.accViews || 0,
        flightResv: found?.flightResv || 0,
        deliveryResv: found?.deliveryResv || 0,
      };
    });

    return {
      usageTrend,
      salesTrend: data?.salesTrend || MOCK_TREND_MONTHLY.salesTrend,
      paymentShare: data?.paymentShare || MOCK_TREND_MONTHLY.paymentShare,
    };
  }, [data, range]);

  // KPI 계산
  const getPctChange = (curr, prev) => {
    if (!prev || prev === 0) return 0;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  };

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
              <Segmented
                options={["일간", "주간", "월간"]}
                value={range}
                onChange={(val) => {
                  setRange(val);
                  message.info(`${val} 데이터로 전환 중...`);
                }}
              />
              <Button icon={<ReloadOutlined />} onClick={reload}>
                새로고침
              </Button>
            </Space>
          </Col>
        </Row>

        {/* KPI */}
        {!loading && <KpiSection summary={processedSummary} loading={loading} />}

        {/* 차트 영역 */}
        {!loading && (
          <>
            <div style={{ height: 24 }} />
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <UserChart
                  data={(data?.userTrend || []).map((item) => ({
                    name:
                      range === "일간"
                        ? item.day
                        : range === "주간"
                          ? item.week
                          : item.month,
                    join: item.join,
                    leave: item.leave,
                    active: item.active,
                  }))}
                />
              </Col>
              <Col xs={24} lg={12}>
                <SalesChart
                  data={displayTrend.salesTrend}
                  range={
                    range === "일간"
                      ? "daily"
                      : range === "주간"
                        ? "weekly"
                        : "monthly"
                  }
                />
              </Col>
            </Row>

            <div style={{ height: 24 }} />

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <UsageChart
                  data={displayTrend.usageTrend}
                  range={
                    range === "일간"
                      ? "daily"
                      : range === "주간"
                        ? "weekly"
                        : "monthly"
                  }
                />
              </Col>
              <Col xs={24} lg={12}>
                <PaymentPie data={displayTrend.paymentShare} />
              </Col>
            </Row>

            <div style={{ height: 24 }} />

            {/* 인기 여행지 & 숙소 */}
            <Ranking
              summary={processedSummary}
              ranking={{
                travels: travelTop5,
                accommodations: accommodationTop5,
              }}
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