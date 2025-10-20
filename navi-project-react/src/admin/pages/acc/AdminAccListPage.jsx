import { useEffect, useState } from "react";
import {
    Layout, Table, Button, Space, Input, Typography, message,
    Spin, Tag, Modal
} from "antd";
import { ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import { API_SERVER_HOST } from "@/common/api/naviApi";

const { Title } = Typography;

const AdminAccommodationListPage = () => {
    const [rows, setRows] = useState([]);               // 전체 숙소 데이터
    const [displayRows, setDisplayRows] = useState([]); // 현재 페이지용 데이터
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 30,
        total: 0,
    });
    const navigate = useNavigate();

    // 전체 숙소 목록 조회 (1회 호출)
    const fetchList = async (keyword = "") => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.get(`${API_SERVER_HOST}/api/adm/accommodations`, {
                params: { keyword },
                headers: { Authorization: `Bearer ${token}` },
            });

            const allData = res?.data?.data || [];
            setRows(allData);

            // 첫 페이지 데이터 초기화
            const startIdx = 0;
            const endIdx = pagination.pageSize;
            setDisplayRows(allData.slice(startIdx, endIdx));

            setPagination({
                current: 1,
                pageSize: pagination.pageSize,
                total: allData.length,
            });
        } catch (err) {
            console.error("❌ 숙소 데이터 로드 실패:", err);
            message.error("숙소 데이터를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 페이지 변경 / 페이지당 개수 변경
    const handlePageChange = (page, pageSize) => {
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        setDisplayRows(rows.slice(startIdx, endIdx));

        setPagination(prev => ({
            ...prev,
            current: page,
            pageSize,
        }));
    };

    // 삭제
    const handleDelete = (accNo, title) => {
        Modal.confirm({
            title: "숙소 삭제 확인",
            content: `정말 "${title}" 숙소를 삭제하시겠습니까?`,
            okText: "삭제",
            okType: "danger",
            cancelText: "취소",
            async onOk() {
                try {
                    const token = localStorage.getItem("accessToken");
                    await axios.delete(`${API_SERVER_HOST}/api/adm/accommodations/${accNo}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    message.success("숙소가 삭제되었습니다.");
                    fetchList(searchKeyword);
                } catch (err) {
                    console.error("삭제 실패:", err);
                    message.error("숙소 삭제 중 오류가 발생했습니다.");
                }
            },
        });
    };

    // 검색 기능 추가
    const handleSearch = (keyword) => {
        setSearchKeyword(keyword);

        if (!keyword.trim()) {
            // 검색어가 없으면 전체 출력
            const startIdx = 0;
            const endIdx = pagination.pageSize;
            setDisplayRows(rows.slice(startIdx, endIdx));
            setPagination((prev) => ({
                ...prev,
                current: 1,
                total: rows.length,
            }));
            return;
        }

        const lower = keyword.toLowerCase();

        // 다중 필드 검색: 코드, 숙소명, 유형, 전화번호, 주소, 지역, 주차, 운영, 체크인, 체크아웃
        const filtered = rows.filter((item) => {
            return (
                item.accId?.toLowerCase().includes(lower) ||
                item.title?.toLowerCase().includes(lower) ||
                item.category?.toLowerCase().includes(lower) ||
                item.tel?.toLowerCase().includes(lower) ||
                item.address?.toLowerCase().includes(lower) ||
                item.townshipName?.toLowerCase().includes(lower) ||
                (item.hasParking ? "가능" : "불가").includes(keyword) ||
                (item.active ? "운영중" : "중단").includes(keyword) ||
                item.checkInTime?.toLowerCase().includes(lower) ||
                item.checkOutTime?.toLowerCase().includes(lower)
            );
        });

        // 페이지 초기화
        const startIdx = 0;
        const endIdx = pagination.pageSize;
        setDisplayRows(filtered.slice(startIdx, endIdx));
        setPagination({
            current: 1,
            pageSize: pagination.pageSize,
            total: filtered.length,
        });
    };

    // 최초 로드
    useEffect(() => {
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 테이블 컬럼
    const columns = [
        { title: "번호", dataIndex: "accNo", width: 80, align: "center", },
        { title: "코드", dataIndex: "accId", width: 100, align: "center" },
        { title: "숙소명", dataIndex: "title", width: 150 },
        { title: "유형", dataIndex: "category", width: 100, align: "center" },
        { title: "전화번호", dataIndex: "tel", width: 150 },
        { title: "주소", dataIndex: "address", width: 250 },
        { title: "지역", dataIndex: "townshipName", width: 180 },
        {
            title: "취사",
            dataIndex: "hasCooking",
            width: 80,
            align: "center",
            render: (v) =>
                v ? <Tag color="green">가능</Tag> : <Tag color="red">불가</Tag>,
        },
        {
            title: "주차",
            dataIndex: "hasParking",
            width: 80,
            align: "center",
            render: (v) =>
                v ? <Tag color="green">가능</Tag> : <Tag color="red">불가</Tag>,
        },
        {
            title: "운영",
            dataIndex: "active",
            width: 90,
            align: "center",
            render: (v) =>
                v ? <Tag color="blue">운영중</Tag> : <Tag color="default">중단</Tag>,
        },
        {
            title: "삭제 가능",
            dataIndex: "deletable",
            width: 100,
            align: "center",
            render: (v) =>
                v ? <Tag color="gold">가능</Tag> : <Tag color="gray">불가</Tag>,
        },
        { title: "체크인", dataIndex: "checkInTime", width: 100, align: "center" },
        { title: "체크아웃", dataIndex: "checkOutTime", width: 100, align: "center" },
        {
            title: "조회수",
            dataIndex: "viewCount",
            width: 100,
            align: "right",
            render: (v) => v?.toLocaleString() || 0,
        },
        { title: "등록일", dataIndex: "createdDate", width: 160, align: "center" },
        { title: "수정일", dataIndex: "modifiedDate", width: 160, align: "center" },
        {
            title: "관리",
            width: 180,
            align: "center",
            fixed: "right",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/adm/accommodations/edit/${record.accNo}`)}
                    >
                        수정
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.accNo, record.title)}
                    >
                        삭제
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <AdminSiderLayout />
            <Layout style={{ padding: "24px" }}>
                <div style={{ padding: 24, background: "#fff", minHeight: "100%" }}>
                    <Space align="center" style={{ marginBottom: 16 }}>
                        <Title level={3} style={{ margin: 0 }}>
                            숙소 관리
                        </Title>

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/adm/accommodations/new")}
                        >
                            숙소 등록
                        </Button>

                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => fetchList(searchKeyword)}
                        >
                            새로고침
                        </Button>

                        <Input.Search
                            placeholder="검색어 입력"
                            allowClear
                            style={{ width: 480 }}
                            enterButton="검색"
                            onSearch={handleSearch}
                        />
                    </Space>

                    {loading ? (
                        <Spin
                            tip="데이터 불러오는 중..."
                            style={{ display: "block", marginTop: 50 }}
                        />
                    ) : (
                        <Table
                            rowKey="accNo"
                            columns={columns}
                            dataSource={displayRows}
                            bordered
                            scroll={{ x: 1600 }}
                            sortDirections={["descend", "ascend"]}
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: pagination.total,
                                showSizeChanger: true,
                                pageSizeOptions: ["10", "20", "30", "50", "100"],
                                onChange: handlePageChange,
                                onShowSizeChange: handlePageChange,
                                showTotal: (total) => `총 ${total.toLocaleString()} 개 숙소`,
                            }}
                        />
                    )}
                </div>
            </Layout>
        </Layout>
    );
};

export default AdminAccommodationListPage;