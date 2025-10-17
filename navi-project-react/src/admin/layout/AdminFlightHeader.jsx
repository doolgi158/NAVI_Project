import { Tabs } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

const AdminFlightHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const currentTab = (() => {
        if (location.pathname.includes("/airports")) return "airports";
        if (location.pathname.includes("/seats")) return "seats";
        if (location.pathname.includes("/reservations")) return "reservations";
        return "list";
    })();

    const items = [
        { key: "list", label: "항공편 관리", path: "/adm/flight/list" },
        { key: "airports", label: "공항 관리", path: "/adm/flight/airports" },
        { key: "seats", label: "좌석 관리", path: "/adm/flight/seats" },
        { key: "reservations", label: "예약 관리", path: "/adm/flight/reservations" },
    ];

    return (
        <div
            style={{
                background: "#fff",
                borderBottom: "1px solid #e5e7eb",
                margin: 0,
                padding: "0 24px",
                borderRadius: "8px"
            }}
        >
            <Tabs
                activeKey={currentTab}
                onChange={(key) => navigate(items.find((i) => i.key === key).path)}
                items={items.map((i) => ({ key: i.key, label: i.label }))}
                size="large"
                style={{
                    background: "#fff",
                    marginBottom: 0,
                    fontWeight: 600,
                }}
            />
        </div>
    );
};

export default AdminFlightHeader;
