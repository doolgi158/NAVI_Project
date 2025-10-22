import { useEffect, useState } from "react";
import { Table, Typography, Button, Space, message, Tag } from "antd";
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
            READY: "blue",
            IN_PROGRESS: "orange",
            DONE: "green",
        };
        const labelMap = {
            READY: "준비중",
            IN_PROGRESS: "배송중",
            DONE: "완료",
        };
        return <Tag color={colorMap[status]}>{labelMap[status] || status}</Tag>;
    };

    // ✅ 상태 변경 로직
    const handleStatusChange = async (record) => {
        let nextStatus;
        switch (record.status) {
            case "READY":
                nextStatus = "IN_PROGRESS";
                break;
            case "IN_PROGRESS":
                nextStatus = "DONE";
                break;
            case "DONE":
                message.info("이미 완료된 배송 그룹입니다.");
                return;
            default:
                nextStatus = "READY";
        }

        try {
            await axios.put(`${API}/${record.groupId}/status`, null, {
                params: { status: nextStatus },
            });
            message.success(`상태가 '${nextStatus}'(으)로 변경되었습니다.`);
            fetchGroups();
        } catch {
            message.error("상태 변경 중 오류가 발생했습니다.");
        }
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
            title: "관리",
            key: "actions",
            align: "center",
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
            />
        </AdminSectionCard>
    );
};

export default AdminDeliveryGroupPage;
