import { Row, Col, Card } from "antd";
import {
    UserOutlined, ApartmentOutlined, StarOutlined, DollarOutlined,
    ShoppingCartOutlined, AlertOutlined, RocketOutlined, SyncOutlined
} from "@ant-design/icons";
import KpiCard from "./KpiCard";
import { COLORS } from "../../../admin/mockdata/dashboardMockData";

const money = (v) => `₩${(v || 0).toLocaleString()}`;
const calcChange = (curr, prev) =>
    prev && prev !== 0 ? (((curr - prev) / prev) * 100).toFixed(1) : 0;

const KpiSection = ({ summary, loading }) => {
    if (!summary || !summary.users) {
        return (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
                📊 데이터를 불러오는 중...
            </div>
        );
    }

    if (loading) {
        return (
            <Row gutter={[16, 16]}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <Col key={i} xs={24} sm={12} md={12} lg={6}>
                        <Card loading />
                    </Col>
                ))}
            </Row>
        );
    }

    const safe = {
        users: summary.users || { total: 0, active: 0, changedPct: 0 },
        travels: summary.travels || { count: 0, changedPct: 0 },
        accommodations: summary.accommodations || { count: 0, changedPct: 0 },
        refunds: summary.refunds || { pct: summary.payments?.refundRate ?? 0, changedPct: 0 },
        payments: summary.payments || {
            paymentCount: 0, refundCount: 0, salesAmount: 0,
            refundAmount: 0, changedPct: 0,
        },
        paymentsTrend: summary.paymentsTrend || [],
        flights: summary.flights || { count: 0 },
    };

    const trend = safe.paymentsTrend || [];
    const curr = trend[trend.length - 1] || safe.payments;
    const prev = trend.length > 1 ? trend[trend.length - 2] : curr;

    // 💹 증감률 계산
    const diffSales = calcChange(curr.salesAmount, prev.salesAmount);
    const diffCount = calcChange(curr.paymentCount, prev.paymentCount);
    const diffRefundAmt = calcChange(curr.refundAmount, prev.refundAmount);

    const currRefundRate =
        Number(curr.salesAmount) > 0
            ? ((Number(curr.refundAmount) / Number(curr.salesAmount)) * 100).toFixed(1)
            : 0;
    const prevRefundRate =
        Number(prev.salesAmount) > 0
            ? ((Number(prev.refundAmount) / Number(prev.salesAmount)) * 100).toFixed(1)
            : 0;
    const diffRefundRate = calcChange(currRefundRate, prevRefundRate);

    return (
        <Row gutter={[16, 16]}>
            {/* 전체 사용자 */}
            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="전체 사용자"
                    value={(safe.users.total ?? 0).toLocaleString()}
                    diff={safe.users.changedPct ?? 0}
                    icon={<UserOutlined style={{ color: COLORS[0] }} />}
                />
            </Col>

            {/* 등록 항공편 */}
            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="등록 항공편"
                    value={(safe.flights.count ?? 0).toLocaleString()}
                    icon={<RocketOutlined style={{ color: COLORS[5] }} />}
                />
            </Col>

            {/* 등록 여행지 */}
            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="등록 여행지"
                    value={(safe.travels.count ?? 0).toLocaleString()}
                    icon={<ApartmentOutlined style={{ color: COLORS[2] }} />}
                />
            </Col>

            {/* 등록 숙소 */}
            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="등록 숙소"
                    value={(safe.accommodations.count ?? 0).toLocaleString()}
                    icon={<StarOutlined style={{ color: COLORS[3] }} />}
                />
            </Col>

            {/* 💰 결제 총액 */}
            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="결제 총액"
                    value={money(curr.salesAmount)}
                    diff={diffSales}
                    icon={<DollarOutlined style={{ color: COLORS[0] }} />}
                />
            </Col>

            {/* 🛒 결제 건수 */}
            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="결제 건수"
                    value={(curr.paymentCount ?? 0).toLocaleString()}
                    diff={diffCount}
                    icon={<ShoppingCartOutlined style={{ color: COLORS[4] }} />}
                />
            </Col>

            {/* 🔁 환불 금액 */}
            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="환불 금액"
                    value={money(curr.refundAmount)}
                    diff={diffRefundAmt}
                    icon={<SyncOutlined style={{ color: COLORS[5] }} />}
                />
            </Col>

            {/* ⚠️ 환불 비율 */}
            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="환불 비율"
                    value={`${currRefundRate}%`}
                    diff={diffRefundRate}
                    icon={<AlertOutlined style={{ color: COLORS[6] || "#ff4d4f" }} />}
                />
            </Col>
        </Row>
    );
};

export default KpiSection;