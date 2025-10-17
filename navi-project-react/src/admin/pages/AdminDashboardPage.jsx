import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Statistic, Badge, Table, Tag, Segmented, Button,
  Space, Typography, Skeleton, 
  Layout} from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined, DollarOutlined,
  UserOutlined, RiseOutlined, AlertOutlined, ApartmentOutlined, LikeOutlined,
  StarOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  ComposedChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import AdminSiderLayout from "../layout/AdminSiderLayout";
import { Content } from "@radix-ui/react-dialog";

const { Title, Text } = Typography;

/** -----------------------------------------------------------
 * 1) 목데이터 & 컬러 팔레트
 *    - 실제 연결 시 /api/admin/dashboard/... 로 교체
 * ----------------------------------------------------------*/
const COLORS = ["#3b82f6", "#22c55e", "#a78bfa", "#f59e0b", "#ef4444", "#14b8a6"];

const MOCK_SUMMARY = {
  users: { total: 12430, new: 320, active: 9450, changedPct: +8.2 },
  travels: { count: 540, changedPct: +3.1 },
  accommodations: { count: 1280, changedPct: +5.7 },
  payments: { amount: 42150000, count: 1680, changedPct: +12.0 },
  refunds: { amount: 890000, pct: 2.1, changedPct: -0.4 },
  flights: { bookings: 320, changedPct: +9.0 },
  cs: { pending: 5, handleRate: 98 },
  security: { loginFailed: 12, blockedIp: 3 },
  engagement: { likes: 13800, bookmarks: 9200, plans: 4200 },
};

const MOCK_TREND_MONTHLY = {
  userTrend: [
    { name: "1월", join: 820, leave: 120, active: 8200 },
    { name: "2월", join: 920, leave: 140, active: 8650 },
    { name: "3월", join: 880, leave: 160, active: 8900 },
    { name: "4월", join: 1020, leave: 150, active: 9300 },
    { name: "5월", join: 1100, leave: 170, active: 9450 },
  ],
  salesTrend: [
    { name: "1월", sales: 12000000, refunds: 500000, count: 380 },
    { name: "2월", sales: 18000000, refunds: 600000, count: 420 },
    { name: "3월", sales: 16500000, refunds: 520000, count: 410 },
    { name: "4월", sales: 21000000, refunds: 740000, count: 450 },
    { name: "5월", sales: 24000000, refunds: 820000, count: 480 },
  ],
  usageTrend: [
    { name: "1월", travelViews: 32000, accViews: 21000, flightResv: 1200 },
    { name: "2월", travelViews: 36000, accViews: 23000, flightResv: 1400 },
    { name: "3월", travelViews: 34000, accViews: 22500, flightResv: 1350 },
    { name: "4월", travelViews: 41000, accViews: 26000, flightResv: 1600 },
    { name: "5월", travelViews: 44000, accViews: 28000, flightResv: 1800 },
  ],
  paymentShare: [
    { method: "카드", value: 52 },
    { method: "카카오페이", value: 24 },
    { method: "네이버페이", value: 14 },
    { method: "계좌이체", value: 10 },
  ],
};

const MOCK_RANKINGS = {
  travels: [
    { rank: 1, title: "제주 성산일출봉", region: "제주", score: 4210, mom: "+8%" },
    { rank: 2, title: "속초 설악산", region: "강원", score: 3920, mom: "+5%" },
    { rank: 3, title: "강릉 안목해변", region: "강원", score: 3510, mom: "+3%" },
    { rank: 4, title: "경주 불국사", region: "경북", score: 3300, mom: "+2%" },
    { rank: 5, title: "여수 낭만포차", region: "전남", score: 3250, mom: "+4%" },
  ],
  accommodations: [
    { rank: 1, name: "롯데시티호텔 제주", city: "제주", reservations: 380, rating: 4.9 },
    { rank: 2, name: "강릉 씨마크 호텔", city: "강릉", reservations: 310, rating: 4.8 },
    { rank: 3, name: "부산 파라다이스 호텔", city: "부산", reservations: 290, rating: 4.7 },
    { rank: 4, name: "여수 히든베이", city: "여수", reservations: 240, rating: 4.6 },
    { rank: 5, name: "속초 켄싱턴", city: "속초", reservations: 210, rating: 4.5 },
  ],
};

/** 포맷터 */
const money = (v) => `₩${(v || 0).toLocaleString()}`;
const pctColor = (n) => (n >= 0 ? "green" : "red");
const PCT_ICON = ({ v }) => (v >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />);

/** -----------------------------------------------------------
 * 2) KPI 카드
 * ----------------------------------------------------------*/
const KpiCard = ({ title, value, suffix, diff, icon, color = "#111827" }) => (
  <Card>
    <Space align="center">
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          background: "#f3f4f6",
        }}
      >
        {icon}
      </div>
      <div>
        <Text type="secondary">{title}</Text>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <Title level={3} style={{ margin: 0, color }}>
            {value}
            {suffix && (
              <Text type="secondary" style={{ marginLeft: 6, fontWeight: 500 }}>
                {suffix}
              </Text>
            )}
          </Title>
          {typeof diff === "number" && (
            <Tag color={pctColor(diff)} style={{ borderRadius: 6 }}>
              <PCT_ICON v={diff} /> {Math.abs(diff)}%
            </Tag>
          )}
        </div>
      </div>
    </Space>
  </Card>
);

/** -----------------------------------------------------------
 * 3) 차트 카드
 * ----------------------------------------------------------*/
const ChartCard = ({ title, extra, children }) => (
  <Card title={title} extra={extra} bodyStyle={{ height: 340 }}>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </Card>
);

/** -----------------------------------------------------------
 * 4) 메인 대시보드
 * ----------------------------------------------------------*/
const AdminDashboard = () => {
  const [range, setRange] = useState("월간"); // '일간' | '주간' | '월간'
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState(null);
  const [ranking, setRanking] = useState(null);

  // 🔌 실제 API 연동 시 여기에서 fetch 교체
  const fetchAll = async () => {
    setLoading(true);
    // const res = await fetch('/api/admin/dashboard?range=monthly'); const json = await res.json();
    await new Promise((r) => setTimeout(r, 600)); // 로딩 연출
    setSummary(MOCK_SUMMARY);
    setTrend(MOCK_TREND_MONTHLY);
    setRanking(MOCK_RANKINGS);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [range]);

  const paymentShareColors = useMemo(
    () => ["#60a5fa", "#34d399", "#a78bfa", "#f59e0b"],
    []
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
    {/* ✅ 왼쪽 사이드바 */}
    <AdminSiderLayout />
    <div style={{ padding: 24 }}>
      {/* 헤더 */}
      <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            메인 대시보드
          </Title>
          <Text type="secondary">서비스 성과와 리스크를 한눈에 확인하세요.</Text>
        </Col>
        <Col>
          <Space>
            <Segmented
              options={["일간", "주간", "월간"]}
              value={range}
              onChange={setRange}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchAll}>
              새로고침
            </Button>
          </Space>
        </Col>
      </Row>

      {/* KPI SUMMARY */}
      {loading || !summary ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Col key={i} xs={24} sm={12} md={12} lg={6}>
              <Card>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12} lg={6}>
            <KpiCard
              title="전체 사용자"
              value={summary.users.total.toLocaleString()}
              diff={summary.users.changedPct}
              icon={<UserOutlined style={{ color: COLORS[0] }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <KpiCard
              title="활성 사용자"
              value={summary.users.active.toLocaleString()}
              suffix="/ 월"
              icon={<RiseOutlined style={{ color: COLORS[1] }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <KpiCard
              title="등록 여행지"
              value={summary.travels.count.toLocaleString()}
              diff={summary.travels.changedPct}
              icon={<ApartmentOutlined style={{ color: COLORS[2] }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <KpiCard
              title="등록 숙소"
              value={summary.accommodations.count.toLocaleString()}
              diff={summary.accommodations.changedPct}
              icon={<StarOutlined style={{ color: COLORS[3] }} />}
            />
          </Col>

          <Col xs={24} sm={12} md={12} lg={6}>
            <KpiCard
              title="결제 총액"
              value={money(summary.payments.amount)}
              suffix=""
              diff={summary.payments.changedPct}
              icon={<DollarOutlined style={{ color: COLORS[0] }} />}
              color="#111827"
            />
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <KpiCard
              title="결제 건수"
              value={summary.payments.count.toLocaleString()}
              icon={<ShoppingCartOutlined style={{ color: COLORS[4] }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <KpiCard
              title="환불 비율"
              value={`${summary.refunds.pct}%`}
              diff={summary.refunds.changedPct}
              icon={<AlertOutlined style={{ color: COLORS[5] }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <Card>
              <Space align="center">
                <Badge status="success" text="CS 처리율" />
                <Title level={3} style={{ margin: 0 }}>
                  {summary.cs.handleRate}%
                </Title>
                <Tag>대기 {summary.cs.pending}건</Tag>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      <div style={{ height: 16 }} />

      {/* CHARTS ROW 1 */}
      {loading || !trend ? (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card><Skeleton active paragraph={{ rows: 10 }} /></Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card><Skeleton active paragraph={{ rows: 10 }} /></Card>
          </Col>
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <ChartCard title="사용자 성장 추이">
              <ComposedChart data={trend.userTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="join" name="신규가입" barSize={18} fill={COLORS[0]} />
                <Bar dataKey="leave" name="탈퇴" barSize={18} fill={COLORS[4]} />
                <Line type="monotone" dataKey="active" name="활성" stroke={COLORS[1]} strokeWidth={2} />
              </ComposedChart>
            </ChartCard>
          </Col>
          <Col xs={24} lg={12}>
            <ChartCard title="매출 & 환불 현황">
              <ComposedChart data={trend.salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(v, n) => (n.includes("환불") ? money(v) : n.includes("매출") ? money(v) : v)} />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" name="매출" barSize={20} fill={COLORS[2]} />
                <Line yAxisId="left" type="monotone" dataKey="refunds" name="환불" stroke={COLORS[4]} />
                <Line yAxisId="right" type="monotone" dataKey="count" name="결제건수" stroke={COLORS[0]} />
              </ComposedChart>
            </ChartCard>
          </Col>
        </Row>
      )}

      <div style={{ height: 16 }} />

      {/* CHARTS ROW 2 */}
      {loading || !trend ? (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card><Skeleton active paragraph={{ rows: 10 }} /></Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card><Skeleton active paragraph={{ rows: 10 }} /></Card>
          </Col>
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <ChartCard title="이용량 트렌드 (조회/예약)">
              <AreaChart data={trend.usageTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="travelViews" name="여행지 조회" stroke={COLORS[0]} fill="url(#g1)" />
                <Area type="monotone" dataKey="accViews" name="숙소 조회" stroke={COLORS[2]} fill="url(#g2)" />
                <Line type="monotone" dataKey="flightResv" name="항공 예약" stroke={COLORS[1]} strokeWidth={2} />
              </AreaChart>
            </ChartCard>
          </Col>
          <Col xs={24} lg={12}>
            <ChartCard title="결제 수단 비율">
              <PieChart>
                <Pie
                  data={trend.paymentShare}
                  dataKey="value"
                  nameKey="method"
                  outerRadius={110}
                  label
                >
                  {trend.paymentShare.map((_, i) => (
                    <Cell key={i} fill={paymentShareColors[i % paymentShareColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ChartCard>
          </Col>
        </Row>
      )}

      <div style={{ height: 16 }} />

      {/* OPERATIONS & RANKINGS */}
      {loading || !ranking ? (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}><Card><Skeleton active paragraph={{ rows: 6 }} /></Card></Col>
          <Col xs={24} lg={8}><Card><Skeleton active paragraph={{ rows: 6 }} /></Card></Col>
          <Col xs={24} lg={8}><Card><Skeleton active paragraph={{ rows: 6 }} /></Card></Col>
        </Row>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card title="운영 현황">
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                    <Text>신고된 게시글</Text>
                    <Badge count={7} status="error" />
                  </Space>
                  <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                    <Text>승인 대기 숙소</Text>
                    <Badge count={3} status="warning" />
                  </Space>
                  <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                    <Text>미처리 CS 문의</Text>
                    <Badge count={5} status="processing" />
                  </Space>
                  <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                    <Text>로그인 실패 / 차단 IP</Text>
                    <Text strong>
                      {summary.security.loginFailed} / {summary.security.blockedIp}
                    </Text>
                  </Space>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="인기 여행지 TOP5">
                <Table
                  size="small"
                  pagination={false}
                  rowKey="rank"
                  columns={[
                    { title: "순위", dataIndex: "rank", width: 60 },
                    { title: "여행지", dataIndex: "title" },
                    { title: "지역", dataIndex: "region", width: 90 },
                    {
                      title: "점수",
                      dataIndex: "score",
                      width: 90,
                      render: (v) => v.toLocaleString(),
                    },
                    { title: "전월", dataIndex: "mom", width: 80 },
                  ]}
                  dataSource={ranking.travels}
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="인기 숙소 TOP5">
                <Table
                  size="small"
                  pagination={false}
                  rowKey="rank"
                  columns={[
                    { title: "순위", dataIndex: "rank", width: 60 },
                    { title: "숙소명", dataIndex: "name" },
                    { title: "지역", dataIndex: "city", width: 90 },
                    {
                      title: "예약",
                      dataIndex: "reservations",
                      width: 80,
                      render: (v) => v.toLocaleString(),
                    },
                    { title: "평점", dataIndex: "rating", width: 70 },
                  ]}
                  dataSource={ranking.accommodations}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
    </Layout>
  );
};

export default AdminDashboard;