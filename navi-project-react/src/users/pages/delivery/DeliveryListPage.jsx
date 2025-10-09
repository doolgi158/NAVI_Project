// src/users/pages/delivery/DeliveryListPage.jsx
import MainLayout from "../../layout/MainLayout";
import { Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";

const DeliveryListPage = () => {
  const navigate = useNavigate();

  const data = [
    {
      key: 1,
      name: "김진섭",
      hotel: "라마다호텔",
      date: "2025-10-15",
      status: "배송중",
    },
    {
      key: 2,
      name: "추유나",
      hotel: "롯데시티호텔",
      date: "2025-10-10",
      status: "배송완료",
    },
  ];

  const columns = [
    {
      title: "예약자",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "숙소명",
      dataIndex: "hotel",
      key: "hotel",
    },
    {
      title: "배송일자",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <Tag color={text === "배송완료" ? "green" : "blue"}>{text}</Tag>
      ),
    },
    {
      title: "상세",
      render: (_, record) => (
        <a onClick={() => navigate(`/delivery/detail/${record.key}`)}>보기</a>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">내 짐배송 내역</h2>
        <Table columns={columns} dataSource={data} pagination={false} />
      </div>
    </MainLayout>
  );
};

export default DeliveryListPage;
