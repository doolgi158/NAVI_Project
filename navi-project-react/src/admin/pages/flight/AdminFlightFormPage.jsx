import { useEffect, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Button,
  Space,
  Select,
  AutoComplete,
  message,
  Alert,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import AdminSectionCard from "../../layout/flight/AdminSectionCard";

const API = "http://localhost:8080/api/admin/flights";

const AdminFlightFormPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { flightId, depTime } = useParams();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // ✅ 상단 알림 상태
  const isEdit = !!flightId && !!depTime;

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

  /** ✅ 항공편 단건 조회 */
  useEffect(() => {
    const fetchFlight = async () => {
      if (!isEdit) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const encodedTime = encodeURIComponent(depTime);
        const res = await axios.get(`${API}/${flightId}/${encodedTime}`, {
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
      } catch {
        message.error("항공편 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchFlight();
  }, [isEdit, flightId, depTime, form]);

  /** ✅ 등록 / 수정 */
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      if (values.depAirportNm === values.arrAirportNm) {
        message.warning("출발공항과 도착공항이 동일합니다.");
        return;
      }
      if (values.depTime.isAfter(values.arrTime)) {
        message.warning("도착시간은 출발시간보다 늦어야 합니다.");
        return;
      }

      const payload = {
        ...values,
        depTime: values.depTime.toISOString(),
        arrTime: values.arrTime.toISOString(),
      };

      if (isEdit) {
        const encodedTime = encodeURIComponent(depTime);
        await axios.put(`${API}/${flightId}/${encodedTime}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("항공편이 수정되었습니다.");
        setAlert({ type: "success", message: "항공편 정보가 수정되었습니다." });
      } else {
        await axios.post(API, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("항공편이 등록되었습니다.");
        setAlert({ type: "success", message: "새 항공편이 등록되었습니다." });
      }

      // ✅ 상단 알림 3초 후 자동 제거
      setTimeout(() => setAlert(null), 3000);

      setTimeout(() => navigate("/adm/flight/list"), 800);
    } catch {
      message.error("저장 중 오류가 발생했습니다.");
      setAlert({ type: "error", message: "저장 중 오류가 발생했습니다." });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 공항 자동완성 옵션 */
  const airportOptions = airports.map((a) => ({
    value: a.airportName,
    label: `${a.airportName} (${a.airportCode})`,
    code: a.airportCode,
  }));

  const handleAirportSelect = (value, option, field) => {
    form.setFieldValue(field, value);
  };

  return (
    <div style={{ padding: 24 }}>
      <AdminSectionCard title={isEdit ? "✈️ 항공편 수정" : "✈️ 항공편 등록"}>
        {/* ✅ 상단 Alert 표시 */}
        {alert && (
          <Alert
            message={alert.message}
            type={alert.type}
            showIcon
            style={{
              marginBottom: 24,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          initialValues={{ economyCharge: 0, prestigeCharge: 0 }}
        >
          {/* 항공편명 */}
          <Form.Item
            label="항공편명 (예: LJ305)"
            name="flightId"
            rules={[{ required: true, message: "항공편명을 입력하세요." }]}
          >
            <Input placeholder="항공편명 입력" disabled={isEdit} />
          </Form.Item>

          {/* 항공사명 */}
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

          {/* 출발/도착 공항 */}
          <Space size="large" style={{ display: "flex" }}>
            <Form.Item
              label="출발공항"
              name="depAirportNm"
              rules={[{ required: true, message: "출발공항을 입력하세요." }]}
              style={{ flex: 1 }}
            >
              <AutoComplete
                options={airportOptions}
                placeholder="예: 김포"
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
                placeholder="예: 제주"
                onSelect={(value, option) =>
                  handleAirportSelect(value, option, "arrAirportNm")
                }
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Space>

          {/* 출발/도착 시간 */}
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

          {/* 요금 */}
          <Space size="large" style={{ display: "flex" }}>
            <Form.Item
              label="일반석 요금"
              name="economyCharge"
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

          {/* ✅ 하단 버튼 */}
          <Form.Item style={{ marginTop: 32 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* 뒤로가기 */}
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{
                  borderRadius: 8,
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  color: "#374151",
                  fontWeight: 500,
                }}
              >
                뒤로가기
              </Button>

              {/* 오른쪽 버튼 */}
              <Space>
                <Button
                  style={{
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    color: "#374151",
                    background: "#fff",
                  }}
                  onClick={() => navigate("/adm/flight/list")}
                >
                  취소
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    borderRadius: 8,
                    background: "linear-gradient(90deg,#2563eb,#1d4ed8)",
                    border: "none",
                    boxShadow: "0 4px 10px rgba(37,99,235,0.3)",
                    fontWeight: 600,
                  }}
                >
                  {isEdit ? "수정하기" : "등록하기"}
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </AdminSectionCard>
    </div>
  );
};

export default AdminFlightFormPage;
