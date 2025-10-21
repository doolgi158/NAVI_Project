import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../../layout/MainLayout";
import {
  Table,
  Typography,
  Button,
  message,
  Tag,
  Tooltip,
  Card,
  Divider,
} from "antd";
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  LeftOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const API_SERVER_HOST = "http://localhost:8080";

const FlightDetailPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("outbound");
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedInbound, setSelectedInbound] = useState(null);

  const { depAirport, arrAirport, depDate, arrDate, seatClass, passengerCount = 1 } =
    state || {};

  // 포맷팅 유틸
  const fmtTime = (str) => {
    if (!str) return "";
    const d = new Date(str);
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };
  const fmtDate = (str) => {
    if (!str) return "";
    const d = new Date(str);
    const day = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(
      d.getDate()
    ).padStart(2, "0")} (${day})`;
  };
  const duration = (dep, arr) => {
    if (!dep || !arr) return "";
    const diff = Math.floor((new Date(arr) - new Date(dep)) / 60000);
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h ? `${h}시간 ${m}분` : `${m}분`;
  };

  // 항공편 로드
  useEffect(() => {
    if (!depAirport || !arrAirport || !depDate) return;

    const body =
      step === "outbound"
        ? { depAirportCode: depAirport, arrAirportCode: arrAirport, depDate, seatClass }
        : { depAirportCode: arrAirport, arrAirportCode: depAirport, depDate: arrDate, seatClass };

    setLoading(true);
    axios
      .post(`${API_SERVER_HOST}/api/flight/detail`, body)
      .then((res) => setFlights(Array.isArray(res.data) ? res.data : []))
      .catch(() => message.error("항공편 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [step, depAirport, arrAirport, depDate, arrDate, seatClass]);

  // 테이블 데이터
  const dataSource = useMemo(
    () =>
      (flights || []).map((f) => ({
        key: `${f.flightNo}-${f.depTime}`,
        ...f,
      })),
    [flights]
  );

  // 테이블 컬럼
  const columns = [
    {
      title: "항공사 / 편명",
      dataIndex: "airlineNm",
      key: "airlineNm",
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text strong>{r.airlineNm}</Text>
          <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600 }}>
            {r.flightNo}
          </Tag>
        </div>
      ),
    },
    {
      title: "출발 ✈️",
      key: "dep",
      sorter: (a, b) => Date.parse(a.depTime) - Date.parse(b.depTime),
      render: (_, r) => (
        <div style={{ lineHeight: 1.3 }}>
          <Text strong style={{ fontSize: 16 }}>
            {fmtTime(r.depTime)}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {fmtDate(r.depTime)} · {r.depAirportName}
          </Text>
        </div>
      ),
      defaultSortOrder: "ascend",
    },
    {
      title: "도착 🛬",
      key: "arr",
      sorter: (a, b) => Date.parse(a.arrTime) - Date.parse(b.arrTime),
      render: (_, r) => (
        <div style={{ lineHeight: 1.3 }}>
          <Text strong style={{ fontSize: 16 }}>
            {fmtTime(r.arrTime)}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {fmtDate(r.arrTime)} · {r.arrAirportName}
          </Text>
        </div>
      ),
    },
    {
      title: "비행시간",
      key: "duration",
      width: 110,
      align: "center",
      render: (_, r) => (
        <Text style={{ color: "#475569" }}>{duration(r.depTime, r.arrTime)}</Text>
      ),
    },
    {
      title: "가격",
      dataIndex: "price",
      key: "price",
      width: 140,
      align: "right",
      sorter: (a, b) => a.price - b.price,
      render: (price) => (
        <Text strong style={{ color: "#1677ff", fontSize: 16 }}>
          {Number(price || 0).toLocaleString()}원
        </Text>
      ),
    },
  ];

  // 네비게이션
  const handleBack = () => {
    if (step === "inbound") {
      setStep("outbound");
      setSelectedInbound(null);
    } else {
      navigate("/flight");
    }
  };
  const handleNext = () => {
    if (step === "outbound") {
      if (!selectedOutbound) return message.warning("출발편을 선택해주세요.");
      if (!arrDate) {
        navigate(`/flight/rsv/${selectedOutbound.flightNo}`, {
          state: { selectedOutbound, passengerCount },
        });
      } else {
        setStep("inbound");
      }
    } else {
      if (!selectedInbound) return message.warning("귀국편을 선택해주세요.");
      navigate(`/flight/rsv/${selectedOutbound.flightNo}`, {
        state: { selectedOutbound, selectedInbound, passengerCount },
      });
    }
  };

  const totalPrice =
    (selectedOutbound?.price || 0) + (selectedInbound?.price || 0);

  return (
    <MainLayout>
      <div
        style={{
          background: "#f6f8fb",
          minHeight: "100vh",
          padding: "48px 0",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "20px",
            width: "92%",
            maxWidth: 1200,
          }}
        >
          {/* 왼쪽 */}
          <Card
            bordered={false}
            style={{
              flex: 3,
              borderRadius: 20,
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 18,
                gap: 8,
              }}
            >
              <Tooltip title="이전으로">
                <Button type="text" icon={<LeftOutlined />} onClick={handleBack} />
              </Tooltip>
              <Title level={4} style={{ margin: 0, color: "#003366" }}>
                {step === "outbound" ? "출발편 선택" : "귀국편 선택"}
              </Title>
            </div>

            {/* ✅ 라디오 제거 + 클릭 선택 */}
            <Table
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              onRow={(record) => ({
                onClick: () => {
                  if (step === "outbound") setSelectedOutbound(record);
                  else setSelectedInbound(record);
                },
              })}
              rowClassName={(record) => {
                const selected =
                  (step === "outbound" &&
                    selectedOutbound &&
                    record.key ===
                    `${selectedOutbound.flightNo}-${selectedOutbound.depTime}`) ||
                  (step === "inbound" &&
                    selectedInbound &&
                    record.key ===
                    `${selectedInbound.flightNo}-${selectedInbound.depTime}`);
                return selected ? "row-selected" : "";
              }}
            />
          </Card>

          {/* 오른쪽 요약 */}
          <Card
            style={{
              flex: 1,
              borderRadius: 16,
              boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
              height: "fit-content",
              position: "sticky",
              top: 80,
            }}
          >
            <Title level={5} style={{ color: "#003366", marginBottom: 10 }}>
              선택한 항공편
            </Title>

            {!selectedOutbound && !selectedInbound ? (
              <Text type="secondary">선택된 항공편이 없습니다.</Text>
            ) : (
              <>
                {selectedOutbound && (
                  <>
                    <Text strong>출발편</Text>
                    <div style={{ marginTop: 6 }}>
                      <Text>{selectedOutbound.airlineNm}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {fmtTime(selectedOutbound.depTime)} {selectedOutbound.depAirportName} →{" "}
                        {fmtTime(selectedOutbound.arrTime)} {selectedOutbound.arrAirportName}
                      </Text>
                      <br />
                      <Text strong style={{ color: "#1677ff" }}>
                        {selectedOutbound.price.toLocaleString()}원
                      </Text>
                    </div>
                  </>
                )}
                {selectedInbound && (
                  <>
                    <Divider style={{ margin: "12px 0" }} />
                    <Text strong>귀국편</Text>
                    <div style={{ marginTop: 6 }}>
                      <Text>{selectedInbound.airlineNm}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {fmtTime(selectedInbound.depTime)} {selectedInbound.depAirportName} →{" "}
                        {fmtTime(selectedInbound.arrTime)} {selectedInbound.arrAirportName}
                      </Text>
                      <br />
                      <Text strong style={{ color: "#1677ff" }}>
                        {selectedInbound.price.toLocaleString()}원
                      </Text>
                    </div>
                  </>
                )}
                <Divider />
                <Text>총 금액</Text>
                <Title level={4} style={{ margin: 0, color: "#1677ff", fontWeight: 700 }}>
                  {totalPrice.toLocaleString()}원
                </Title>
              </>
            )}

            <Divider />

            {/* 하단 버튼 일자 정렬 */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                marginTop: "16px",
              }}
            >
              <Button
                onClick={handleBack}
                shape="round"
                style={{
                  width: 120,
                  height: 40,
                  background: "#f4f5f7",
                  color: "#334155",
                  border: "1px solid #d1d5db",
                  fontWeight: 500,
                }}
              >
                ← 뒤로가기
              </Button>

              <Button
                type="primary"
                shape="round"
                style={{
                  width: 120,
                  height: 40,
                  background: "#1677ff",
                  borderColor: "#1677ff",
                  fontWeight: 600,
                }}
                onClick={handleNext}
                disabled={
                  (step === "outbound" && !selectedOutbound) ||
                  (step === "inbound" && !selectedInbound)
                }
              >
                {step === "outbound"
                  ? arrDate
                    ? "귀국편 선택 →"
                    : "예약 진행 →"
                  : "예약 진행 →"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ✅ 스타일 */}
      <style>{`
        .ant-table-tbody > tr {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ant-table-tbody > tr:hover td {
          background: #f3f7ff !important;
        }
        .row-selected td {
          background: #e6f2ff !important;
          border-top: 2px solid #1677ff !important;
          border-bottom: 2px solid #1677ff !important;
        }
        .ant-table-thead > tr > th {
          background: #fbfcfe !important;
          color: #334155 !important;
          font-weight: 600 !important;
        }
      `}</style>
    </MainLayout>
  );
};

export default FlightDetailPage;