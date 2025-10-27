import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Input,
    Space,
    message,
    Popconfirm,
    Select,
    Layout,
    Card,
    Divider,
} from "antd";
import {
    DeleteOutlined,
    SearchOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import api from "@/common/api/naviApi";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import { Content, Header } from "antd/es/layout/layout";
import { useNavigate } from "react-router-dom";
import AdminThemeProvider from "../../theme/AdminThemeProvider";

const NAVI_BLUE = "#0A3D91";

export default function AdminPlanList() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const navigate = useNavigate();

    /** ✅ 여행계획 목록 조회 */
    const fetchPlans = async (page = 1, size = pageSize, keyword = search) => {
        setLoading(true);
        try {
            const res = await api.get(
                `/adm/plan?page=${page - 1}&size=${size}&search=${encodeURIComponent(
                    keyword
                )}&sort=planId&direction=desc`
            );
            const data = res.data;
            setPlans(data.content || []);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error("❌ 여행계획 목록 로딩 실패:", err);
            message.error("데이터를 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans(currentPage, pageSize, search);
    }, [pageSize, currentPage]);

    /** ✅ 검색 */
    const handleSearch = async () => {
        setCurrentPage(1);
        fetchPlans(1, pageSize, search);
    };

    /** ✅ 삭제 */
    const handleDelete = async (planId) => {
        try {
            await api.delete(`/adm/plan/${planId}`);
            message.success("삭제되었습니다.");
            fetchPlans(currentPage, pageSize, search);
        } catch (err) {
            message.error("삭제 실패");
        }
    };

    /** ✅ 컬럼 정의 */
    const columns = [
        {
            title: "No",
            key: "no",
            align: "center",
            width: 80,
            render: (_, __, index) => (currentPage - 1) * pageSize + (index + 1),
        },
        {
            title: "Plan ID",
            dataIndex: "planId",
            key: "planId",
            align: "center",
            width: 100,
        },
        {
            title: "제목",
            dataIndex: "title",
            key: "title",
            align: "left",
            render: (text, record) => (
                <a
                    style={{ color: NAVI_BLUE }}
                    onClick={() => navigate(`/adm/plan/${record.planId}`)}
                >
                    {text}
                </a>
            ),
            ellipsis: true,
        },
        { title: "ID", dataIndex: "userId", key: "userId", width: 150, align: "center" },
        { title: "작성자", dataIndex: "userName", key: "userName", width: 150, align: "center" },
        {
            title: "여행기간",
            key: "period",
            width: 200,
            align: "center",
            render: (_, record) =>
                `${record.startDate || "-"} ~ ${record.endDate || "-"}`,
        },
        {
            title: "등록일",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 160,
            align: "center",
            render: (v) => (v ? v.replace("T", " ").substring(0, 16) : "-"),
        },
        {
            title: "수정일",
            dataIndex: "updatedAt",
            key: "updatedAt",
            width: 160,
            align: "center",
            render: (v) => (v ? v.replace("T", " ").substring(0, 16) : "-"),
        },
        {
            title: "관리",
            key: "actions",
            align: "center",
            fixed: "right",
            width: 100,
            render: (_, record) => (
                <Popconfirm
                    title="정말 삭제하시겠습니까?"
                    onConfirm={() => handleDelete(record.planId)}
                    okText="삭제"
                    cancelText="취소"
                >
                    <Button danger icon={<DeleteOutlined />} size="small">
                        삭제
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    const paginationConfig = {
        current: currentPage,
        pageSize: pageSize,
        total: totalElements,
        showSizeChanger: false,
        showTotal: (total) => `총 ${total}건`,
        onChange: (page) => setCurrentPage(page),
    };

    return (
        <AdminThemeProvider>
            <Layout className="min-h-screen" style={{ background: "#F7F8FB" }}>
                <AdminSiderLayout />
                <Layout>
                    <Header
                        className="px-6 flex items-center"
                        style={{
                            background: "#FFFFFF",
                            boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
                            height: 64,
                        }}
                    >
                        <h2 style={{ margin: 0, color: NAVI_BLUE, fontWeight: 700 }}>
                            NAVI 관리자 – 여행계획
                        </h2>
                    </Header>

                    <Content style={{ padding: 24 }}>
                        <Card
                            bordered={false}
                            style={{ boxShadow: "0 6px 20px rgba(10,61,145,0.06)" }}
                            bodyStyle={{ padding: 20 }}
                        >
                            {/* 🔍 검색 & 필터 */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    flexWrap: "wrap",
                                }}
                            >
                                <Input
                                    placeholder="제목 또는 작성자 검색"
                                    prefix={<SearchOutlined />}
                                    allowClear
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onPressEnter={handleSearch}
                                    style={{ flex: 1, minWidth: 280 }}
                                />
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={handleSearch}
                                >
                                    검색
                                </Button>

                                <Divider type="vertical" />

                                <Select
                                    value={pageSize}
                                    onChange={(v) => {
                                        setPageSize(Number(v));
                                        setCurrentPage(1);
                                    }}
                                    style={{ width: 140 }}
                                    options={[
                                        { label: "10개씩 보기", value: 10 },
                                        { label: "20개씩 보기", value: 20 },
                                        { label: "50개씩 보기", value: 50 },
                                    ]}
                                />

                                <div style={{ flex: 1 }} />

                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => navigate("/adm/plan/register")}
                                >
                                    새 계획 등록
                                </Button>
                            </div>

                            <Divider style={{ margin: "16px 0" }} />

                            <Table
                                bordered={false}
                                size="middle"
                                columns={columns}
                                dataSource={plans}
                                loading={loading}
                                rowKey="planId"
                                pagination={paginationConfig}
                                scroll={{ x: 1200 }}
                                sticky
                                rowClassName={(_, index) =>
                                    index % 2 === 0 ? "zebra-row" : ""
                                }
                            />
                        </Card>
                    </Content>
                </Layout>
            </Layout>

            <style>{`
        .zebra-row td {
          background: #FAFCFF;
        }
      `}</style>
        </AdminThemeProvider>
    );
}
