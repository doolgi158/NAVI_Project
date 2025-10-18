import { Row, Col, Card, Space, Badge, Typography } from "antd";
import {
    UserOutlined, RiseOutlined, ApartmentOutlined, StarOutlined, DollarOutlined,
    ShoppingCartOutlined, AlertOutlined,
    RocketOutlined
} from "@ant-design/icons";
import KpiCard from "./KpiCard";
import { COLORS } from "../../../admin/mockdata/dashboardMockData";

const { Title } = Typography;
const money = (v) => `₩${(v || 0).toLocaleString()}`;

const DashboardKpiSection = ({ summary, loading }) => {
    // 아직 데이터가 안 들어왔을 때
    if (!summary || !summary.users) {
        return (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
                📊 사용자 데이터를 불러오는 중...
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

    // 안전한 기본 구조 정의 (백엔드 미구현 항목 보호)
    const safe = {
        users: summary.users || { total: 0, active: 0, changedPct: 0 },
        travels: summary.travels || { count: 0, changedPct: 0 },
        accommodations: summary.accommodations || { count: 0, changedPct: 0 },
        payments: summary.payments || { amount: 0, count: 0, changedPct: 0 },
        refunds: summary.refunds || { pct: 0, changedPct: 0 },
        cs: summary.cs || { handleRate: 0 },
    };

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="전체 사용자"
                    value={(safe.users.total ?? 0).toLocaleString()}
                    diff={safe.users.changedPct ?? 0}
                    icon={<UserOutlined style={{ color: COLORS[0] }} />}
                />
            </Col>

            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="활성 사용자"
                    value={(safe.users.active ?? 0).toLocaleString()}
                    suffix="/ 월"
                    icon={<RiseOutlined style={{ color: COLORS[1] }} />}
                />
            </Col>

            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="등록 여행지"
                    value={(safe.travels.count ?? 0).toLocaleString()}
                    icon={<ApartmentOutlined style={{ color: COLORS[2] }} />}
                />
            </Col>

            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="등록 숙소"
                    value={(safe.accommodations.count ?? 0).toLocaleString()}
                    icon={<StarOutlined style={{ color: COLORS[3] }} />}
                />
            </Col>

            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="결제 총액"
                    value={money(safe.payments.amount)}
                    diff={safe.payments.changedPct ?? 0}
                    icon={<DollarOutlined style={{ color: COLORS[0] }} />}
                />
            </Col>

            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="결제 건수"
                    value={(safe.payments.count ?? 0).toLocaleString()}
                    diff={safe.payments.changedPct ?? 0}
                    icon={<ShoppingCartOutlined style={{ color: COLORS[4] }} />}
                />
            </Col>

            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="환불 비율"
                    value={`${safe.refunds.pct ?? 0}%`}
                    diff={safe.refunds.changedPct ?? 0}
                    icon={<AlertOutlined style={{ color: COLORS[5] }} />}
                />
            </Col>

            <Col xs={24} sm={12} md={12} lg={6}>
                <KpiCard
                    title="등록 항공편"
                    value={(safe.flights?.count ?? 0).toLocaleString()}
                    icon={<RocketOutlined style={{ color: COLORS[5] }} />}
                />
            </Col>
        </Row>
    );
};

export default DashboardKpiSection;
