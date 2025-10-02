import { useState } from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const { Header } = Layout;

const HeaderLayout = () => {
  const [open, setOpen] = useState(false);

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
      {/* 로고 */}
      <div
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "#2F3E46",
        }}
      >
        NAVI
      </div>

      {/* PC 메뉴 */}
      <Menu
        mode="horizontal"
        items={items}
        style={{
          flex: 1,
          marginLeft: "40px",
          borderBottom: "none",
          backgroundColor: "#fff",
          color: "#2F3E46"
        }}
        className="hidden md:flex"
      />

      {/* 모바일 햄버거 버튼 */}
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={() => setOpen(true)}
        className="md:hidden"
      />

      {/* Drawer: 모바일 메뉴 */}
      <Drawer
        title="메뉴"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
      >
        <Menu mode="vertical" items={items} style={{color:"#2F3E46"}}/>
      </Drawer>
    </Header>
  );
};

export default HeaderLayout;