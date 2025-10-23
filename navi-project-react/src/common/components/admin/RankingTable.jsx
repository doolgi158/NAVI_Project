import { Row, Col, Card, Table } from "antd";

const RankingTable = ({ ranking }) => {
    console.log("🔥 ranking:", ranking);

    // ✅ 여행지 / 숙소 둘 다 안전하게 데이터 구조 보정
    const travelData = Array.isArray(ranking)
        ? ranking
        : Array.isArray(ranking?.travels)
            ? ranking.travels
            : [];

    const accData = Array.isArray(ranking?.accommodations)
        ? ranking.accommodations
        : [];

    return (
        <Row gutter={[16, 16]} justify="space-between">
            {/* 인기 여행지 TOP5 */}
            <Col xs={24} lg={12}>
                <Card
                    title="인기 여행지 TOP5"
                    bordered={false}
                    style={{ borderRadius: 12, boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
                >
                    <Table
                        size="small"
                        pagination={false}
                        rowKey="rank"
                        dataSource={travelData}
                        columns={[
                            { title: "순위", dataIndex: "rank", align: "center", width: 60 },
                            { title: "아이디", dataIndex: "id", align: "center", width: 80 },
                            { title: "여행지", dataIndex: "title" },
                            { title: "지역", dataIndex: "region", align: "center", width: 120 },
                            { title: "점수", dataIndex: "score", align: "right", width: 90 },
                        ]}
                    />
                </Card>
            </Col>

            {/* 인기 숙소 TOP5 */}
            <Col xs={24} lg={12}>
                <Card
                    title="인기 숙소 TOP5"
                    bordered={false}
                    style={{ borderRadius: 12, boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
                >
                    <Table
                        size="small"
                        pagination={false}
                        rowKey="rank"
                        dataSource={accData}
                        columns={[
                            { title: "순위", dataIndex: "rank", align: "center", width: 60 },
                            { title: "아이디", dataIndex: "id", align: "center", width: 80 },
                            { title: "숙소명", dataIndex: "name" },
                            { title: "지역", dataIndex: "region", align: "center", width: 120 },
                            { title: "조회수", dataIndex: "views", align: "right", width: 90 },
                        ]}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default RankingTable;
