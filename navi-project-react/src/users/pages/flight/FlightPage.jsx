import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Select,
  DatePicker,
  InputNumber,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Tag,
  Divider,
  message,
} from "antd";
import {
  SwapOutlined,
  CalendarOutlined,
  TeamOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import MainLayout from "../../layout/MainLayout";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const FlightPage = () => {
  const [tripType, setTripType] = useState("round");
  const [dates, setDates] = useState({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [seatClass, setSeatClass] = useState("economy");
  const navigate = useNavigate();

  const airportList = [
    { airportCode: "GMP", airportName: "김포" },
    { airportCode: "CJU", airportName: "제주" },
    { airportCode: "PUS", airportName: "김해(부산)" },
    { airportCode: "TAE", airportName: "대구" },
    { airportCode: "CJJ", airportName: "청주" },
    { airportCode: "KWJ", airportName: "광주" },
    { airportCode: "MWX", airportName: "무안" },
    { airportCode: "RSU", airportName: "여수" },
    { airportCode: "USN", airportName: "울산" },
    { airportCode: "KUV", airportName: "군산" },
    { airportCode: "YNY", airportName: "양양" },
    { airportCode: "HIN", airportName: "사천" },
    { airportCode: "WJU", airportName: "원주" },
  ];

  const handleFromChange = (value) => {
    setFrom(value);
    if (value !== "CJU") setTo("CJU");
    else setTo("");
  };

  const disablePastOrFutureDates = (current) => {
    const today = dayjs().startOf("day");
    const lastAvailable = dayjs().add(30, "day").endOf("day");
    return current < today || current > lastAvailable;
  };

  const handleSearch = () => {
    if (tripType === "round" && !dates.range) {
      message.warning("왕복은 가는 날과 오는 날을 선택해야 합니다.");
      return;
    }
    if (tripType === "one" && !dates.dep) {
      message.warning("편도는 출발일을 선택해야 합니다.");
      return;
    }
    if (!from || !to) {
      message.warning("출발지와 도착지를 선택해주세요.");
      return;
    }
    if (from === to) {
      message.warning("출발지와 도착지는 달라야 합니다.");
      return;
    }

    const formatted =
      tripType === "round"
        ? {
          depDate: dates.range?.[0]?.format("YYYY-MM-DD"),
          arrDate: dates.range?.[1]?.format("YYYY-MM-DD"),
        }
        : { depDate: dates.dep?.format("YYYY-MM-DD") };

    navigate("/flight/detail", {
      state: {
        tripType,
        depAirport: from,
        arrAirport: to,
        depDate: formatted.depDate,
        arrDate: formatted.arrDate || null,
        passengerCount: passengers,
        seatClass,
      },
    });
  };

  const filteredArrivalList =
    from === "CJU"
      ? airportList.filter((a) => a.airportCode !== "CJU")
      : airportList.filter((a) => a.airportCode === "CJU");

  return (
    <MainLayout>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #ffffff 0%, #ffffff 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 700,
            borderRadius: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            backgroundColor: "#fffefc",
            position: "relative",
          }}
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              color: "#1677ff",
              fontWeight: "500",
            }}
            onClick={() => navigate(-1)}
          >

          </Button>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <RocketOutlined
              style={{ fontSize: 40, color: "#1677ff", marginBottom: 10 }}
            />
            <Title level={3} style={{ color: "#003366", marginBottom: 0 }}>
              항공권 예매
            </Title>
            <Text type="secondary">국내선 전용 실시간 예약 시스템</Text>
          </div>

          <Divider />

          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div style={{ textAlign: "left" }}>
              <Tag
                color={tripType === "round" ? "blue" : "default"}
                style={{
                  cursor: "pointer",
                  marginRight: 8,
                  fontSize: 16,
                  padding: "8px 20px",
                  borderRadius: 30,
                  height: 40,
                  lineHeight: "24px",
                }}
                onClick={() => setTripType("round")}
              >
                왕복
              </Tag>
              <Tag
                color={tripType === "one" ? "blue" : "default"}
                style={{
                  cursor: "pointer",
                  fontSize: 16,
                  padding: "8px 20px",
                  borderRadius: 30,
                  height: 40,
                  lineHeight: "24px",
                }}
                onClick={() => setTripType("one")}
              >
                편도
              </Tag>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Text strong>
                  <EnvironmentOutlined /> 출발지
                </Text>
                <Select
                  placeholder="출발 공항 선택"
                  value={from || undefined}
                  onChange={handleFromChange}
                  style={{ width: "100%" }}
                >
                  {airportList.map((a) => (
                    <Option key={a.airportCode} value={a.airportCode}>
                      {a.airportName}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={12}>
                <Text strong>
                  <EnvironmentOutlined /> 도착지
                </Text>
                <Select
                  placeholder="도착 공항 선택"
                  value={to || undefined}
                  onChange={setTo}
                  style={{ width: "100%" }}
                  disabled={from !== "CJU"}
                >
                  {filteredArrivalList.map((a) => (
                    <Option key={a.airportCode} value={a.airportCode}>
                      {a.airportName}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>

            <div>
              <Text strong>
                <CalendarOutlined /> 여행 날짜
              </Text>
              {tripType === "round" ? (
                <RangePicker
                  style={{ width: "100%" }}
                  onChange={(val) => setDates({ range: val })}
                  disabledDate={disablePastOrFutureDates} // ✅ 추가
                />
              ) : (
                <DatePicker
                  style={{ width: "100%" }}
                  onChange={(val) => setDates({ dep: val })}
                  disabledDate={disablePastOrFutureDates} // ✅ 추가
                />
              )}
            </div>


            <Row gutter={16}>
              <Col span={12}>
                <Text strong>
                  <TeamOutlined /> 탑승객
                </Text>
                <InputNumber
                  min={1}
                  max={9}
                  value={passengers}
                  onChange={setPassengers}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col span={12}>
                <Text strong>좌석 등급</Text>
                <Select
                  value={seatClass}
                  onChange={setSeatClass}
                  style={{ width: "100%" }}
                >
                  <Option value="economy">일반석</Option>
                  <Option value="business">비즈니스석</Option>
                </Select>
              </Col>
            </Row>

            <Button
              type="primary"
              size="large"
              block
              shape="round"
              icon={<SwapOutlined />}
              style={{
                backgroundColor: "#1677ff",
                fontWeight: "bold",
                height: 50,
              }}
              onClick={handleSearch}
            >
              항공편 검색
            </Button>
          </Space>
        </Card>
      </div>
    </MainLayout>
  );
};

export default FlightPage;