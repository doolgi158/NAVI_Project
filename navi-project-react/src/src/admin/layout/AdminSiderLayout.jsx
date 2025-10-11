import { Layout, Menu } from "antd";
import { UserOutlined, HomeOutlined, ApartmentOutlined, RocketOutlined, CalendarOutlined,
        DropboxOutlined, DollarOutlined, UndoOutlined, FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;

const AdminSiderLayout = () => {
  const navigate = useNavigate();

  // 메뉴 이동용 핸들러
  const menuHandler = {
    "1" : () => navigate("/adm/Users"),
    "2" : () => navigate("/adm/travels"),
    "3" : () => navigate("/adm/accommodations"),
    "4" : () => navigate("/adm/transports"),
    "5" : () => navigate("/adm/plans"),
    "6" : () => navigate("/adm/deliveries"),
    "7" : () => navigate("/adm/payments"),
    "8" : () => navigate("/adm/refunds"),
    "9" : () => navigate("/adm/board")
  }

  const handleMenuClick = (e) => {
    (menuHandler[e.key] || (() => console.warn("없는 메뉴입니다.")))();
  }

    return (
      <Sider width={200} className="bg-white shadow-md">
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          style={{ height: "100%", borderRight: 0 }}
          onClick={handleMenuClick}
          items={[
          { key: "1", icon: <UserOutlined />, label: "사용자" },
          { key: "2", icon: <HomeOutlined />, label: "여행지" },
          { key: "3", icon: <ApartmentOutlined />, label: "숙소" },
          { key: "4", icon: <RocketOutlined />, label: "교통" },
          { key: "5", icon: <CalendarOutlined />, label: "여행 계획" },
          { key: "6", icon: <DropboxOutlined />, label: "짐 배송" },
          { key: "7", icon: <DollarOutlined />, label: "결제 관리" },
          { key: "8", icon: <UndoOutlined />, label: "환불 관리" },
          { key: "9", icon: <FileTextOutlined />, label: "게시판" },
          ]}
        />
      </Sider>
    );
}

export default AdminSiderLayout;