import { Row, Col, Card, Space, Typography, Badge, Table } from "antd";

const { Text } = Typography;

const DashboardOperationAndRanking = ({ summary, ranking }) => (
    <Row gutter={[16, 16]}>
        {/* 운영 현황 */}
        <Col xs={24} lg={6}>
            <Card
                title="운영 현황"
                bodyStyle={{ padding: "12px 16px" }}
                headStyle={{ fontWeight: 600 }}
            >
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
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
                        <Badge count={summary?.cs?.pending || 0} status="processing" />
                    </Space>
                    <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                        <Text>로그인 실패 / 차단 IP</Text>
                        <Text strong>
                            {summary?.security?.loginFailed} / {summary?.security?.blockedIp}
                        </Text>
                    </Space>
                </Space>
            </Card>
        </Col>

        {/* 인기 여행지 TOP5 */}
        <Col xs={24} lg={9}>
            <Card title="인기 여행지 TOP5">
                <Table
                    size="small"
                    pagination={false}
                    rowKey="rank"
                    columns={[
                        { title: "순위", dataIndex: "rank", width: 60, sorter: (a, b) => a.rank - b.rank, defaultSortOrder: "ascend" },
                        { title: "아이디", dataIndex: "id", width: 80, sorter: (a, b) => a.id - b.id },
                        { title: "여행지", dataIndex: "title", sorter: (a, b) => a.title.localeCompare(b.title) },
                        { title: "지역", dataIndex: "region", width: 100, sorter: (a, b) => a.region.localeCompare(b.region) },
                        { title: "점수", dataIndex: "score", width: 80, align: "right", sorter: (a, b) => a.score - b.score, render: (v) => v.toLocaleString() },
                    ]}
                    dataSource={ranking?.travels || []}
                />
            </Card>
        </Col>

        {/* 인기 숙소 TOP5 */}
        <Col xs={24} lg={9}>
            <Card title="인기 숙소 TOP5">
                <Table
                    size="small"
                    pagination={false}
                    rowKey="rank"
                    columns={[
                        { title: "순위", dataIndex: "rank", width: 60, sorter: (a, b) => a.rank - b.rank },
                        { title: "숙소명", dataIndex: "name", sorter: (a, b) => a.name.localeCompare(b.name) },
                        { title: "지역", dataIndex: "city", width: 90, sorter: (a, b) => a.city.localeCompare(b.city) },
                        { title: "예약", dataIndex: "reservations", width: 80, sorter: (a, b) => a.reservations - b.reservations, render: (v) => v.toLocaleString() },
                        { title: "평점", dataIndex: "rating", width: 70, sorter: (a, b) => a.rating - b.rating },
                    ]}
                    dataSource={ranking?.accommodations || []}
                />
            </Card>
        </Col>
    </Row>
);

export default DashboardOperationAndRanking;
