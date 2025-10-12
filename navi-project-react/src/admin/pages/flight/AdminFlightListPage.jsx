import { useEffect, useState } from "react";
import { Table, Button, Popconfirm, Space, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8080/api/admin/flights";

const AdminFlightListPage = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 항공편 목록 불러오기
  const fetchFlights = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      console.log("🛫 API 응답:", res.data);

      // ✅ 안전한 배열 처리 (data 또는 data.data 지원)
      const list = Array.isArray(res.data) ? res.data : res.data.data || [];
      setFlights(list);
    } catch (err) {
      console.error("❌ 항공편 목록 오류:", err);
      message.error("항공편 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  // 항공편 삭제
  const handleDelete = async (record) => {
    try {
      const { flightId, depTime } = record;
      await axios.delete(`${API}/${flightId}/${depTime}`);
      message.success("항공편이 삭제되었습니다.");
      fetchFlights();
    } catch (err) {
      message.error("삭제 중 오류가 발생했습니다.");
    }
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      title: "항공편명",
      dataIndex: "flightId",
      key: "flightId",
    },
    {
      title: "항공사",
      dataIndex: "airlineNm",
      key: "airlineNm",
    },
    {
      title: "출발공항",
      dataIndex: "depAirportNm",
      key: "depAirportNm",
    },
    {
      title: "도착공항",
      dataIndex: "arrAirportNm",
      key: "arrAirportNm",
    },
    {
      title: "출발시간",
      dataIndex: "depTime",
      key: "depTime",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "도착시간",
      dataIndex: "arrTime",
      key: "arrTime",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "일반석 요금",
      dataIndex: "economyCharge",
      key: "economyCharge",
      render: (val) => val?.toLocaleString() + "원",
    },
    {
      title: "비즈니스 요금",
      dataIndex: "prestigeCharge",
      key: "prestigeCharge",
      render: (val) => val?.toLocaleString() + "원",
    },
    {
      title: "관리",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() =>
              navigate(`/adm/flight/edit/${record.flightId}/${record.depTime}`)
            }
          >
            수정
          </Button>
          <Popconfirm
            title="정말 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" danger>
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">항공편 목록</h2>
        <Button type="primary" onClick={() => navigate("/adm/flight/new")}>
          항공편 등록
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={Array.isArray(flights) ? flights : []} // ✅ 안전 처리
        rowKey={(record) => `${record.flightId}_${record.depTime}`}
        loading={loading}
        bordered
      />
    </div>
  );
};

export default AdminFlightListPage;
