import { useEffect, useState } from "react";
import { Table, Typography, Button, Space, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import AdminSectionCard from "../../layout/flight/AdminSectionCard";

const { Title } = Typography;
const API = "http://localhost:8080/api/admin/deliveries/reservations";

const AdminDeliveryReservationPage = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API);
            setReservations(res.data);
        } catch {
            message.error("배송 예약 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const columns = [
        { title: "예약 ID", dataIndex: "rsvId", key: "rsvId" },
        { title: "회원", dataIndex: "userName", key: "userName" },
        { title: "출발지", dataIndex: "fromAddress", key: "fromAddress" },
        { title: "도착지", dataIndex: "toAddress", key: "toAddress" },
        { title: "가방 수", dataIndex: "bagCount", key: "bagCount" },
        { title: "예약일", dataIndex: "createdAt", key: "createdAt" },
        { title: "상태", dataIndex: "status", key: "status" },
    ];

    return (
        <AdminSectionCard
            title="배송 예약 관리"
            extra={
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={fetchReservations}>
                        새로고침
                    </Button>
                </Space>
            }
        >
            <Table
                rowKey="rsvId"
                loading={loading}
                dataSource={reservations}
                columns={columns}
                bordered
            />
        </AdminSectionCard>
    );
};

export default AdminDeliveryReservationPage;
