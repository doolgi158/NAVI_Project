import { Tabs } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

const AdminDeliveryHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const activeKey = location.pathname.includes("groups")
        ? "groups"
        : location.pathname.includes("reservations")
            ? "reservations"
            : "bags"; // 기본 탭

    const items = [
        { key: "bags", label: "가방 요금표" },
        { key: "groups", label: "배송 그룹 관리" },
        { key: "reservations", label: "예약 관리" },
    ];

    const onChange = (key) => navigate(`/adm/deliveries/${key}`);

    return (
        <div className="bg-white rounded-md p-3 shadow-sm">
            <Tabs activeKey={activeKey} onChange={onChange} items={items} />
        </div>
    );
};

export default AdminDeliveryHeader;
