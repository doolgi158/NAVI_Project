import { Layout, Menu, Button, Image, Space } from "antd";
import naviLogo from "../images/navi_logo.png";
import { useModal } from "../../common/components/Login/ModalProvider";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import UserMenuDropdown from "../../common/components/UserMenuDropdown";

const { Header } = Layout;

const HeaderLayout = () => {
  const { showModal } = useModal();
  const loginstate = useSelector((state) => state.login);

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

      {/* 메인 메뉴 */}
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

      {/* 로그인 상태에 따라 */}
      {loginstate.token ? (
        <UserMenuDropdown />
      ) : (
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
      )}
    </Header>
  );
};

export default HeaderLayout;