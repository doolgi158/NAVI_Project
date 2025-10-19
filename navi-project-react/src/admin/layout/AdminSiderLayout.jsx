import { Avatar, Button, Layout, Menu, message } from "antd";
import {
  UserOutlined, HomeOutlined, ApartmentOutlined, RocketOutlined, CalendarOutlined,
  DropboxOutlined, DollarOutlined, UndoOutlined, FileTextOutlined, LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setlogout } from "../../common/slice/loginSlice";

const { Sider } = Layout;

const AdminSiderLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));
  const [adminName, setAdminName] = useState(localStorage.getItem("username") || "관리자");

  /* 관리자 접근 권한 검사 */
  useEffect(() => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("accessToken");

    // 로그인 안 했거나 관리자가 아닐 경우 접근 차단
    if (!token || username !== "asdf") {
      message.warning("관리자만 접근할 수 있습니다.");
      navigate("/");
    }
  }, [navigate]);

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

  /* 메뉴 이동 */
  const menuHandler = {
    "1": () => navigate("/adm/users"),
    "2": () => navigate("/adm/travel"),
    "3": () => navigate("/adm/accommodations"),
    "4": () => navigate("/adm/flight"),
    "5": () => navigate("/adm/plans"),
    "6": () => navigate("/adm/deliveries"),
    "7": () => navigate("/adm/payments"),
    "8": () => navigate("/adm/refunds"),
    "9": () => navigate("/adm/board"),
  };

  const handleMenuClick = (e) => {
    (menuHandler[e.key] || (() => console.warn("없는 메뉴입니다.")))();
  };

  return (
    <Sider width={240} className="bg-white shadow-md">
      <div className="flex flex-col h-full">
        {/* 상단 메뉴 */}
        <div className="flex-1 overflow-y-auto">
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            style={{ borderRight: 0 }}
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
        </div>

        {/* 하단 관리자 정보 + 로그아웃 */}
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
      </div>
    </Sider>
  );
};

export default AdminSiderLayout;
