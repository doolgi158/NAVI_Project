import { useState } from "react";
import { Layout, Menu, Button, Drawer, Image, Space } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import naviLogo from "../images/navi_logo.png";
import { useModal } from "../../common/components/Login/ModalProvider";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../common/slice/loginSlice.js";

const { Header } = Layout;

const HeaderLayout = () => {
  const [open, setOpen] = useState(false);
  const { showModal } = useModal();
  const loginstate = useSelector((state) => state.login);
  const dispatch = useDispatch();

  const items = [
    { key: "1", label: <Link to="/travel">여행지</Link> },
    { key: "2", label: <Link to="/accommodations">숙소</Link> },
    { key: "3", label: <Link to="/flight">교통</Link> },
    { key: "4", label: <Link to="/plans">여행계획</Link> },
    { key: "5", label: <Link to="/deliveries">짐 배송</Link> },
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
         height: '64px',
      }}
    >
      {/* 로고 섹션: 강제 중앙 정렬 및 line-height 0 적용  */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          height: '100%', 
          lineHeight: 0 // 글꼴 기반의 baseline 정렬 방지
        }}
      >
        <Link to="/">
          <Image 
            src={naviLogo} 
            alt="naviLogo" 
            preview={false} 
            width={130} 
            style={{ 
                display: 'block' // Image 컴포넌트를 block 레벨로 처리하여 정렬 명확히
            }} 
          />
        </Link>
      </div>

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
      {
        loginstate.username ?
          <Space>
            <Button
              type="default"
              onClick={() => dispatch(logout())}
              className="text-red-500 hover:text-red-700"
            >
              로그아웃
            </Button>
          </Space>
          :
          <Space>
            <Button
              type="default"
              onClick={() => showModal("login")}
              className="text-sb-teal hover:text-sb-purple"
            >
              로그인
            </Button>
            <Button
              type="primary"
              href="/signup"
              className="bg-sb-teal hover:bg-sb-gold"
            >
              회원가입
            </Button>
          </Space>
      }
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={() => setOpen(true)}
      />
      <Drawer
        title="메뉴"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
      >
        <Menu mode="vertical" items={items} style={{ color: "#2F3E46" }} />
        {
          loginstate.username ?
            <div className="mt-4 flex flex-col gap-2">
              <Button
                danger
                block
                onClick={() => {
                dispatch(logout());   // Redux 상태 초기화
                setOpen(false);       // Drawer 닫기
                }}
              >
              로그아웃
              </Button>
            </div>
          :
            <div className="mt-4 flex flex-col gap-2">
              <Button type="primary" block onClick={() => showModal("login")}>
                로그인
              </Button>
              <Button block href="/signup">
                회원가입
              </Button>
            </div>
        }
      </Drawer>
    </Header>
  );
};

export default HeaderLayout;