import { Avatar, Button, Layout, Menu, message } from "antd";
import {
  UserOutlined, EnvironmentOutlined, ApartmentOutlined, RocketOutlined, CalendarOutlined,
  DropboxOutlined, DollarOutlined, UndoOutlined, FileTextOutlined, LogoutOutlined,
  DashboardOutlined, BankOutlined, KeyOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setlogout } from "../../common/slice/loginSlice";

const { Sider } = Layout;

const AdminSiderLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));
  const [adminName, setAdminName] = useState(localStorage.getItem("username") || "관리자");

  /** ✅ 현재 선택된 메뉴 key */
  const [selectedKeys, setSelectedKeys] = useState(["0"]);

  /* 로그아웃 처리 */
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");

    dispatch(setlogout());
    message.success("로그아웃되었습니다.");
    setIsLoggedIn(false);
    navigate("/");
  };

  /* 메뉴 이동 (포커스 우선 → 페이지 이동) */
  const menuHandler = {
    "0": () => navigate("/adm/dashboard"),
    "1": () => navigate("/adm/users"),
    "2": () => navigate("/adm/travel"),
    "3-1": () => navigate("/adm/accommodations"),
    "3-2": () => navigate("/adm/rooms"),
    "4": () => navigate("/adm/flight"),
    "5": () => navigate("/adm/plan"),
    "6": () => navigate("/adm/deliveries"),
    "7": () => navigate("/adm/payments"),
    "8": () => navigate("/adm/refunds"),
    "9": () => navigate("/adm/manager/board"),
  };

  const handleMenuClick = (e) => {
    setSelectedKeys([e.key]);
    // ✅ navigate는 한 프레임 뒤에 실행하여 포커스 먼저 반영
    setTimeout(() => {
      (menuHandler[e.key] || (() => console.warn("없는 메뉴입니다.")))();
    }, 0);
  };

  /** ✅ 현재 URL 경로 기준으로 자동 포커싱 */
  useEffect(() => {
    const path = location.pathname;

    if (path.includes("/adm/dashboard")) setSelectedKeys(["0"]);
    else if (path.includes("/adm/users")) setSelectedKeys(["1"]);
    else if (path.includes("/adm/travel")) setSelectedKeys(["2"]);
    else if (path.includes("/adm/accommodations")) setSelectedKeys(["3-1"]);
    else if (path.includes("/adm/rooms")) setSelectedKeys(["3-2"]);
    else if (path.includes("/adm/flight")) setSelectedKeys(["4"]);
    else if (path.includes("/adm/plan")) setSelectedKeys(["5"]);
    else if (path.includes("/adm/deliveries")) setSelectedKeys(["6"]);
    else if (path.includes("/adm/payments")) setSelectedKeys(["7"]);
    else if (path.includes("/adm/refunds")) setSelectedKeys(["8"]);
    else if (path.includes("/adm/manager/board")) setSelectedKeys(["9"]);
    else setSelectedKeys([]);
  }, [location.pathname]);

  return (
    <Sider width={240} className="bg-white shadow-md flex flex-col h-full">
      {/* 메뉴 */}
      <div className="flex-1 overflow-y-auto">
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={["3"]}
          style={{ borderRight: 0 }}
          onClick={handleMenuClick}
          items={[
            { key: "0", icon: <DashboardOutlined />, label: "대시보드" },
            { key: "1", icon: <UserOutlined />, label: "사용자 관리" },
            { key: "2", icon: <EnvironmentOutlined />, label: "여행지 관리" },
            {
              key: "3",
              icon: <ApartmentOutlined />,
              label: "숙박 관리",
              children: [
                { key: "3-1", icon: <BankOutlined />, label: "숙소 관리" },
                { key: "3-2", icon: <KeyOutlined />, label: "객실 관리" },
              ],
            },
            { key: "4", icon: <RocketOutlined />, label: "항공편 관리" },
            { key: "5", icon: <CalendarOutlined />, label: "여행 계획 관리" },
            { key: "6", icon: <DropboxOutlined />, label: "짐 배송 관리" },
            { key: "7", icon: <DollarOutlined />, label: "결제 관리" },
            { key: "8", icon: <UndoOutlined />, label: "환불 관리" },
            { key: "9", icon: <FileTextOutlined />, label: "게시판 관리" },
          ]}
        />
      </div>

      {/* 하단 관리자 정보 + 로그아웃 버튼 */}
      {isLoggedIn && (
        <div className="border-t border-gray-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar size="small" icon={<UserOutlined />} />
            <div className="text-xs text-gray-600 leading-tight">
              <div className="font-medium">{adminName}</div>
              <div className="text-gray-400 text-[11px]">관리자</div>
            </div>
          </div>
          <Button
            type="text"
            size="small"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          />
        </div>
      )}
    </Sider>
  );
};

export default AdminSiderLayout;
