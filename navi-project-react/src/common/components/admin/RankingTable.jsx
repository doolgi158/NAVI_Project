import { Row, Col, Card, Space, Typography, Badge, Table } from "antd";

const { Text } = Typography;

const RankingTable = ({ ranking }) => (
    <Row gutter={[16, 16]}>
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
                        { title: "아이디", dataIndex: "id", width: 80, sorter: (a, b) => a.id - b.id },
                        { title: "숙소명", dataIndex: "name", sorter: (a, b) => a.name.localeCompare(b.name) },
                        { title: "지역", dataIndex: "region", width: 90, sorter: (a, b) => a.region.localeCompare(b.region) },
                        {
                            title: "조회수",
                            dataIndex: "views",
                            width: 100,
                            align: "right",
                            sorter: (a, b) => a.views - b.views,
                            render: (v) => v.toLocaleString(),
                        },
                    ]}
                    dataSource={ranking?.accommodations || []}
                />
            </Card>
        </Col>
    </Row>
);

export default RankingTable;
