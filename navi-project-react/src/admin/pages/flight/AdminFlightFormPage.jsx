import { useEffect, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Button,
  Card,
  message,
  Space,
  Select,
  AutoComplete,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const API = "http://localhost:8080/api/admin/flights";

const AdminFlightFormPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { flightId, depTime } = useParams();
  const [loading, setLoading] = useState(false);
  const isEdit = !!flightId && !!depTime;

  /** ✅ 항공사 / 공항 목록 초기화 */
  const [airlines, setAirlines] = useState([
    "대한항공",
    "아시아나항공",
    "제주항공",
    "진에어",
    "에어부산",
    "티웨이항공",
    "에어서울",
  ]);

  const [airports] = useState([
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
    { airportCode: "JDG", airportName: "정석(훈련)" },
  ]);

  /** ✅ 기존 항공편 데이터 불러오기 */
  useEffect(() => {
    const fetchFlight = async () => {
      if (!isEdit) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${API}/${flightId}/${depTime}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        form.setFieldsValue({
          flightId: data.flightId,
          airlineNm: data.airlineNm,
          depAirportNm: data.depAirportNm,
          arrAirportNm: data.arrAirportNm,
          depTime: dayjs(data.depTime),
          arrTime: dayjs(data.arrTime),
          economyCharge: data.economyCharge,
          prestigeCharge: data.prestigeCharge,
        });
      } catch (err) {
        console.error("❌ 항공편 조회 오류:", err);
        message.error("항공편 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchFlight();
  }, [isEdit, flightId, depTime, form]);

  /** ✅ 폼 제출 (등록/수정 공통) */
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      // 유효성 체크
      if (values.depAirportNm === values.arrAirportNm) {
        message.warning("출발공항과 도착공항이 동일합니다.");
        setLoading(false);
        return;
      }
      if (values.depTime.isAfter(values.arrTime)) {
        message.warning("도착시간은 출발시간보다 늦어야 합니다.");
        setLoading(false);
        return;
      }

      const payload = {
        ...values,
        depTime: values.depTime.toISOString(),
        arrTime: values.arrTime.toISOString(),
      };

      if (isEdit) {
        await axios.put(`${API}/${flightId}/${depTime}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("항공편이 수정되었습니다.");
      } else {
        await axios.post(API, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("항공편이 등록되었습니다.");
      }

      setTimeout(() => navigate("/adm/flight", { replace: true }), 800);
    } catch (err) {
      console.error("❌ 저장 오류:", err);
      message.error("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 공항 자동완성용 데이터 변환 */
  const airportOptions = airports.map((a) => ({
    value: a.airportName,
    label: `${a.airportName} (${a.airportCode})`,
    code: a.airportCode,
  }));

  /** ✅ 공항 선택 시 이름만 저장 + 코드 콘솔 확인 */
  const handleAirportSelect = (value, option, field) => {
    form.setFieldValue(field, value);
    console.log(`[선택됨] ${field}:`, option.code);
  };

  return (
    <div style={{ background: "#f8f9fc", minHeight: "100vh", padding: "50px 0" }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ borderRadius: 8 }}
            >
              뒤로가기
            </Button>
            <span>{isEdit ? "✈️ 항공편 수정" : "🆕 항공편 등록"}</span>
          </Space>
        }
        bordered={false}
        style={{
          maxWidth: 800,
          margin: "0 auto",
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
          background: "#fff",
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          initialValues={{ economyCharge: 0, prestigeCharge: 0 }}
        >
          {/* ✈️ 항공편 정보 */}
          <Form.Item
            label="항공편명 (예: LJ305)"
            name="flightId"
            rules={[{ required: true, message: "항공편명을 입력하세요." }]}
          >
            <Input placeholder="항공편명 입력" disabled={isEdit} />
          </Form.Item>

          {/* 항공사 선택 */}
          <Form.Item
            label="항공사명"
            name="airlineNm"
            rules={[{ required: true, message: "항공사를 입력하세요." }]}
          >
            <Select
              showSearch
              placeholder="항공사 선택 또는 직접 입력"
              optionFilterProp="children"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div style={{ padding: 8 }}>
                    <Input
                      placeholder="직접 추가"
                      onPressEnter={(e) => {
                        const newAirline = e.target.value.trim();
                        if (newAirline && !airlines.includes(newAirline)) {
                          setAirlines([...airlines, newAirline]);
                          form.setFieldValue("airlineNm", newAirline);
                          message.success(`항공사 '${newAirline}' 추가됨`);
                        }
                        e.target.value = "";
                      }}
                    />
                  </div>
                </>
              )}
            >
              {airlines.map((a) => (
                <Select.Option key={a} value={a}>
                  {a}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* 🛫 공항 정보 */}
          <Space size="large" style={{ display: "flex" }}>
            <Form.Item
              label="출발공항"
              name="depAirportNm"
              rules={[{ required: true, message: "출발공항을 입력하세요." }]}
              style={{ flex: 1 }}
            >
              <AutoComplete
                options={airportOptions}
                placeholder="출발공항 입력 (예: 김포)"
                onSelect={(value, option) =>
                  handleAirportSelect(value, option, "depAirportNm")
                }
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item
              label="도착공항"
              name="arrAirportNm"
              rules={[{ required: true, message: "도착공항을 입력하세요." }]}
              style={{ flex: 1 }}
            >
              <AutoComplete
                options={airportOptions}
                placeholder="도착공항 입력 (예: 제주)"
                onSelect={(value, option) =>
                  handleAirportSelect(value, option, "arrAirportNm")
                }
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Space>

          {/* 🕓 시간 정보 */}
          <Space size="large" style={{ display: "flex" }}>
            <Form.Item
              label="출발시간"
              name="depTime"
              rules={[{ required: true, message: "출발시간을 선택하세요." }]}
              style={{ flex: 1 }}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              label="도착시간"
              name="arrTime"
              rules={[{ required: true, message: "도착시간을 선택하세요." }]}
              style={{ flex: 1 }}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Space>

          {/* 💰 요금 정보 */}
          <Space size="large" style={{ display: "flex" }}>
            <Form.Item
              label="일반석 요금"
              name="economyCharge"
              rules={[{ required: true, message: "일반석 요금을 입력하세요." }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(v) => v.replace(/,/g, "")}
                placeholder="예: 45000"
              />
            </Form.Item>

            <Form.Item
              label="비즈니스 요금"
              name="prestigeCharge"
              rules={[{ required: true, message: "비즈니스 요금을 입력하세요." }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(v) => v.replace(/,/g, "")}
                placeholder="예: 120000"
              />
            </Form.Item>
          </Space>

          {/* ✅ 버튼 */}
          <Form.Item style={{ marginTop: 32 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => navigate("/adm/flight")}>취소</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  background: "linear-gradient(90deg,#2563eb,#1d4ed8)",
                  border: "none",
                  boxShadow: "0 4px 10px rgba(37,99,235,0.3)",
                }}
              >
                {isEdit ? "수정하기" : "등록하기"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminFlightFormPage;
