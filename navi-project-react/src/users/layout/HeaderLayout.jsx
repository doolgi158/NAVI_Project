import { useState } from "react";
import { Layout, Menu, Button, Drawer, Image, Space } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import naviLogo from "../images/navi_logo.png";
import { useModal } from "../../common/ModalProvider";

const { Header } = Layout;

const HeaderLayout = () => {
  const [open, setOpen] = useState(false);
  const { showModal } = useModal();

  const items = [
    { key: "1", label: "여행지" },
    { key: "2", label: "숙소" },
    { key: "3", label: "교통" },
    { key: "4", label: "여행계획" },
    { key: "5", label: "짐 배송" },
    { key: "6", label: "게시판" },
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
      }}
    >
      <Image src={naviLogo} alt="naviLogo" preview={false} width={130} />

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

        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setOpen(true)}
          className="md:hidden"
        />
      </Space>

      <Drawer
        title="메뉴"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
      >
        <Menu mode="vertical" items={items} style={{ color: "#2F3E46" }} />
        <div className="mt-4 flex flex-col gap-2">
          <Button type="primary" block onClick={() => showModal("login")}>
            로그인
          </Button>
          <Button block href="/signup">
            회원가입
          </Button>
        </div>
      </Drawer>
    </Header>
  );
};

export default HeaderLayout;