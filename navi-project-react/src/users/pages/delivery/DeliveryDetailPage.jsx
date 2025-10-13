import MainLayout from "../../layout/MainLayout";
import { useParams } from "react-router-dom";
import { Descriptions, Tag, Button } from "antd";

const DeliveryDetailPage = () => {
  const { id } = useParams();

  // TODO: 추후 axios.get(`/api/delivery/${id}`)
  const mockData = {
    id,
    name: "김진섭",
    phone: "010-1234-5678",
    hotel: "라마다호텔",
    address: "제주시 연동 123",
    date: "2025-10-15",
    status: "배송중",
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-6 text-center">배송 상세 정보</h2>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="예약번호">{mockData.id}</Descriptions.Item>
          <Descriptions.Item label="이름">{mockData.name}</Descriptions.Item>
          <Descriptions.Item label="전화번호">{mockData.phone}</Descriptions.Item>
          <Descriptions.Item label="숙소명">{mockData.hotel}</Descriptions.Item>
          <Descriptions.Item label="주소">{mockData.address}</Descriptions.Item>
          <Descriptions.Item label="배송일자">{mockData.date}</Descriptions.Item>
          <Descriptions.Item label="상태">
            <Tag color={mockData.status === "배송완료" ? "green" : "blue"}>
              {mockData.status}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <div className="text-center mt-6">
          <Button type="primary">문의하기</Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default DeliveryDetailPage;
