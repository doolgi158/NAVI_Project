import { useEffect, useState } from "react";
import { Form, Input, DatePicker, InputNumber, Button, Card, message, Space } from "antd";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

const API = "http://localhost:8080/api/admin/flights";

const AdminFlightFormPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { flightId, depTime } = useParams();
  const [loading, setLoading] = useState(false);

  const isEdit = !!flightId && !!depTime;

  // ✅ 기존 항공편 데이터 불러오기 (수정 시)
  useEffect(() => {
    const fetchFlight = async () => {
      if (!isEdit) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("ACCESS_TOKEN") || localStorage.getItem("accessToken");
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

  // ✅ 폼 제출
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("ACCESS_TOKEN") || localStorage.getItem("access_token");
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
      navigate("/adm/flights");
    } catch (err) {
      console.error("❌ 저장 오류:", err);
      message.error("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#f8f9fc", minHeight: "100vh", padding: "50px 0" }}>
      <Card
        title={isEdit ? "✈️ 항공편 수정" : "🆕 항공편 등록"}
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
          <Form.Item
            label="항공편명 (예: LJ305)"
            name="flightId"
            rules={[{ required: true, message: "항공편명을 입력하세요." }]}
          >
            <Input placeholder="항공편명 입력" disabled={isEdit} />
          </Form.Item>

          <Form.Item
            label="항공사명"
            name="airlineNm"
            rules={[{ required: true, message: "항공사를 입력하세요." }]}
          >
            <Input placeholder="항공사명 입력" />
          </Form.Item>

          <Space size="large" style={{ display: "flex" }}>
            <Form.Item
              label="출발공항"
              name="depAirportNm"
              rules={[{ required: true, message: "출발공항을 입력하세요." }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="출발공항 입력" />
            </Form.Item>
            <Form.Item
              label="도착공항"
              name="arrAirportNm"
              rules={[{ required: true, message: "도착공항을 입력하세요." }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="도착공항 입력" />
            </Form.Item>
          </Space>

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
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/,/g, "")}
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
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/,/g, "")}
                placeholder="예: 120000"
              />
            </Form.Item>
          </Space>

          <Form.Item style={{ marginTop: 32 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => navigate("/adm/flights")}>취소</Button>
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
