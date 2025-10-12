import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, Button, DatePicker, InputNumber, message } from "antd";
import dayjs from "dayjs";
import axios from "axios";

const API = "http://localhost:8080/api/admin/flights";

const AdminFlightFormPage = () => {
  const { flightId, depTime } = useParams();
  const navigate = useNavigate();
  const isEdit = !!(flightId && depTime);
  const [form] = Form.useForm();

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (isEdit) {
      axios
        .get(`${API}/${flightId}/${depTime}`)
        .then((res) => {
          const data = res.data;
          console.log("🛠 불러온 항공편:", data);
          form.setFieldsValue({
            ...data,
            depTime: dayjs(data.depTime),
            arrTime: dayjs(data.arrTime),
          });
        })
        .catch(() => {
          message.error("항공편 정보를 불러오지 못했습니다.");
        });
    }
  }, [isEdit, flightId, depTime]);

  // 저장 처리
  const onFinish = async (values) => {
    const payload = {
      ...values,
      depTime: values.depTime.format("YYYY-MM-DDTHH:mm:ss"),
      arrTime: values.arrTime.format("YYYY-MM-DDTHH:mm:ss"),
      seatInitialized: false,
    };

    try {
      if (isEdit) {
        await axios.put(`${API}/${flightId}/${depTime}`, payload);
        message.success("항공편이 수정되었습니다.");
      } else {
        await axios.post(API, payload);
        message.success("항공편이 등록되었습니다.");
      }
      navigate("/adm/flight");
    } catch (err) {
      console.error("❌ 저장 오류:", err);
      message.error("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "항공편 수정" : "항공편 등록"}
      </h2>

      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="항공편명"
          name="flightId"
          rules={[{ required: true, message: "항공편명을 입력하세요" }]}
        >
          <Input disabled={isEdit} />
        </Form.Item>

        <Form.Item
          label="항공사명"
          name="airlineNm"
          rules={[{ required: true, message: "항공사명을 입력하세요" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="출발공항명"
          name="depAirportNm"
          rules={[{ required: true, message: "출발공항명을 입력하세요" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="도착공항명"
          name="arrAirportNm"
          rules={[{ required: true, message: "도착공항명을 입력하세요" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="출발시간"
          name="depTime"
          rules={[{ required: true, message: "출발시간을 입력하세요" }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm" />
        </Form.Item>

        <Form.Item
          label="도착시간"
          name="arrTime"
          rules={[{ required: true, message: "도착시간을 입력하세요" }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm" />
        </Form.Item>

        <Form.Item
          label="일반석 요금"
          name="economyCharge"
          rules={[{ required: true, message: "요금을 입력하세요" }]}
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>

        <Form.Item
          label="비즈니스 요금"
          name="prestigeCharge"
          rules={[{ required: true, message: "요금을 입력하세요" }]}
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>

        <Form.Item className="text-center">
          <Button type="primary" htmlType="submit">
            {isEdit ? "수정" : "등록"}
          </Button>
          <Button
            style={{ marginLeft: 10 }}
            onClick={() => navigate("/adm/flight")}
          >
            취소
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminFlightFormPage;
