import { useEffect, useState } from "react";
import { Table, Typography, Button, Space, message, Tag, Modal } from "antd";
import { ReloadOutlined, SyncOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import AdminSectionCard from "../../layout/flight/AdminSectionCard";

const { Title } = Typography;
const API = "http://localhost:8080/api/admin/deliveries/groups";

const AdminDeliveryGroupPage = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);

    // ✅ 목록 조회
    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API);
            setGroups(res.data);
        } catch {
            message.error("배송 그룹 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    // ✅ 상태 색상 정의
    const getStatusTag = (status) => {
        const colorMap = {
            READY: "default",
            IN_PROGRESS: "orange",
            COMPLETED: "green",
        };
        const labelMap = {
            READY: "준비중",
            IN_PROGRESS: "배송중",
            COMPLETED: "완료",
        };
        return <Tag color={colorMap[status]}>{labelMap[status] || status}</Tag>;
    };

    // ✅ 상태 변경 로직
    const handleStatusChange = async (record) => {
        const nextStatusMap = {
            READY: "IN_PROGRESS",
            IN_PROGRESS: "COMPLETED",
            COMPLETED: "READY",
        };
        const nextStatus = nextStatusMap[record.status] || "READY";

        Modal.confirm({
            title: "상태 변경 확인",
            content: `${record.status} → ${nextStatus} 으로 변경하시겠습니까?`,
            onOk: async () => {
                try {
                    await axios.put(`${API}/${record.groupId}/status`, null, {
                        params: { status: nextStatus },
                    });
                    message.success(`상태가 '${nextStatus}'(으)로 변경되었습니다.`);
                    fetchGroups();
                } catch {
                    message.error("상태 변경 중 오류가 발생했습니다.");
                }
            },
        });
    };


    // ✅ 테이블 컬럼 정의
    const columns = [
        { title: "그룹 ID", dataIndex: "groupId", key: "groupId", align: "center" },
        { title: "지역", dataIndex: "region", key: "region", align: "center" },
        {
            title: "배송일",
            dataIndex: "deliveryDate",
            key: "deliveryDate",
            align: "center",
            render: (val) => (val ? dayjs(val).format("YYYY-MM-DD") : "-"),
        },
        { title: "시간대", dataIndex: "timeSlot", key: "timeSlot", align: "center" },
        {
            title: "상태",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (val) => getStatusTag(val),
        },
        {
            title: "예약 수",
            dataIndex: "reservationCount",
            key: "reservationCount",
            align: "center",
        },
        {
            title: "등록일",
            dataIndex: "createdAt",
            align: "center",
            width: 180,
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
        },
        {
            title: "수정일",
            dataIndex: "updatedAt",
            align: "center",
            width: 180,
            sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
            render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
        },
        {
            title: "관리",
            key: "actions",
            align: "center",
            fixed: "right",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<SyncOutlined />}
                        onClick={() => handleStatusChange(record)}
                    >
                        상태 변경
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <AdminSectionCard
            title="배송 그룹 관리"
            extra={
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={fetchGroups}>
                        새로고침
                    </Button>
                </Space>
            }
        >
            <Table
                rowKey="groupId"
                loading={loading}
                dataSource={groups}
                columns={columns}
                bordered
                style={{
                    minWidth: "100%",
                    tableLayout: "auto",  // ✅ 자동 폭 계산
                    whiteSpace: "nowrap", // ✅ 줄바꿈 방지
                }}
                scroll={{ x: "max-content" }}
            />
        </AdminSectionCard>
    );
};

export default AdminDeliveryGroupPage;
