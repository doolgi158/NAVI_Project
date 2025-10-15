import { Layout, Menu, Button, Image, Space } from "antd";
import naviLogo from "../images/navi_logo.png";
import { useModal } from "../../common/components/login/ModalProvider";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UserMenuDropdown from "../../common/components/UserMenuDropdown";
import { useEffect, useState } from "react";

const { Header } = Layout;

const HeaderLayout = () => {
  const { showModal } = useModal();
  const navigate = useNavigate();

  // Redux 로그인 상태 가져오기
  const loginstate = useSelector((state) => state.login);
  
  // 로컬 스토리지 기반 로그인 상태 체크
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));
  
  useEffect(() => {
    // Redux 상태가 변하면 다시 동기화
    const token = loginstate.token || localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, [loginstate]);

  // 로그인 상태에서만 프로필 드롭다운, 없으면 로그인/회원가입 버튼
  const renderAuthButtons = () => {
    if (isLoggedIn) {
      return <UserMenuDropdown />;
    }
    return (
      <Space>
        <Button
          type="default"
          onClick={() => showModal("login")}
          className="text-sb-teal hover:text-sb-purple"
        >
          로그인
        </Button>
        <Button type="primary" className="bg-sb-teal hover:bg-sb-gold">
          <Link to="/users/signup">회원가입</Link>
        </Button>
      </Space>
    );
  };

  // 상단 네비게이션 메뉴
  const items = [
    { key: "1", label: <Link to="/travel">여행지</Link> },
    { key: "2", label: <Link to="/accommodations">숙소</Link> },
    { key: "3", label: <Link to="/flight">교통</Link> },
    { key: "4", label: <Link to="/plans">여행계획</Link> },
    { key: "5", label: <Link to="/delivery">짐 배송</Link> },
    { key: "6", label: <Link to="/board">게시판</Link> },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
        padding: "0 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        height: "64px",
        position: "relative",
        zIndex: 1000,
      }}
    >
      {/* 로고 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          lineHeight: 0,
        }}
      >
        <Link to="/">
          <Image
            src={naviLogo}
            alt="naviLogo"
            preview={false}
            width={130}
            style={{ display: "block" }}
          />
        </Link>
      </div>

      {/* 메뉴 */}
      <Menu
        mode="horizontal"
        items={items}
        style={{
          flex: 1,
          marginLeft: "40px",
          borderBottom: "none",
          backgroundColor: "#fff",
          color: "#2F3E46",
        }}
        className="hidden md:flex"
      />

      {/* 로그인 or 프로필 */}
      {renderAuthButtons()}
    </Header>
  );
};

export default HeaderLayout;