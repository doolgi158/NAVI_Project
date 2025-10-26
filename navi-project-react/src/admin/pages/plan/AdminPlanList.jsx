import React, { useEffect, useState } from "react";
import { Table, Button, Input, Space, message, Popconfirm, Select, Layout } from "antd";
import { DeleteOutlined, EditOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";
import api from "@/common/api/naviApi";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import { Content, Header } from "antd/es/layout/layout";
import { useNavigate } from "react-router-dom";

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
            const res = await api.get(`/adm/plan?page=${page - 1}&size=${size}&search=${encodeURIComponent(keyword)}&sort=planId&direction=desc`);
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

    /** ✅ 테이블 컬럼 정의 */
    const columns = [
        {
            title: "No",
            key: "no",
            align: "center",
            width: 80,
            // ✅ 현재 페이지 기준으로 번호 계산
            render: (_, __, index) => (currentPage - 1) * pageSize + (index + 1),
        },
        { title: "Plan ID", dataIndex: "planId", key: "planId", width: 100, align: "center", sorter: (a, b) => a.planId - b.planId, defaultSortOrder: 'descend', },
        {
            title: "제목",
            dataIndex: "title",
            key: "title",
            align: "center",
            render: (text, record) => (
                <a
                    style={{ color: "#0A3D91", fontWeight: 600 }}
                    onClick={() => navigate(`/adm/plan/${record.planId}`)}
                >
                    {text}
                </a>
            ),
        },
        { title: "ID", dataIndex: "userId", key: "userId", width: 150, align: "center" },
        { title: "작성자", dataIndex: "userName", key: "userName", width: 150, align: "center" },
        {
            title: "여행기간",
            key: "period",
            render: (_, record) => `${record.startDate || "-"} ~ ${record.endDate || "-"}`,
            width: 200,
            align: "center"
        },
        {
            title: "등록일",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 180,
            align: "center",
            render: (v) => (v ? v.replace("T", " ").substring(0, 16) : "-"),
        },
        {
            title: "수정일",
            dataIndex: "updatedAt",
            key: "updatedAt",
            align: "center",
            width: 180,
            render: (v) => (v ? v.replace("T", " ").substring(0, 16) : "-"),
        },
        {
            title: "관리",
            key: "actions",
            align: 'center',
            fixed: "right",
            width: 100,
            render: (_, record) => (
                <Space>
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
                </Space>
            ),
        },
    ];

    /** ✅ 페이지네이션 설정 */
    const paginationConfig = {
        current: currentPage,
        pageSize: pageSize,
        total: totalElements,
        showSizeChanger: false,
        showTotal: (total) => `총 ${total}건`,
        onChange: (page) => setCurrentPage(page),
    };

    return (
        <Layout className="min-h-screen">
            <AdminSiderLayout />
            <Layout>
                <Header
                    className="px-6 shadow flex items-center text-xl font-bold"
                    style={{ background: "#fefce8" }}
                >
                    NAVI 관리자 페이지
                </Header>
                <Content
                    className="p-1"
                    style={{ minHeight: "100vh", padding: "24px" }}
                >
                    <div style={{ padding: 24, minHeight: "100vh", background: "#fefce843" }}>
                        <h2 className="text-2xl font-bold mb-6">여행계획 관리 목록</h2>

                        <div className="flex justify-between mb-4">
                            <Space>
                                <Input
                                    placeholder="제목 또는 작성자 검색"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ width: 280 }}
                                    onPressEnter={handleSearch}
                                />
                                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                                    검색
                                </Button>
                            </Space>

                            <Space>
                                <Select value={`${pageSize}`} onChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }} style={{ width: 130 }}>
                                    <Select.Option value="10">10개씩 보기</Select.Option>
                                    <Select.Option value="20">20개씩 보기</Select.Option>
                                    <Select.Option value="50">50개씩 보기</Select.Option>
                                </Select>

                            </Space>
                        </div>

                        <Table
                            bordered
                            size="middle"
                            columns={columns}
                            dataSource={plans}
                            loading={loading}
                            rowKey="planId"
                            pagination={paginationConfig}
                            scroll={{ x: 1200 }}
                            style={{ background: "white", borderRadius: 8 }}
                        />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
