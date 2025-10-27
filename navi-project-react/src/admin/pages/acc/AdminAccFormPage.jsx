import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Space,
  Typography,
  message,
  Spin,
  Row,
  Col,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import { SaveOutlined, RollbackOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Title } = Typography;

const AdminAccFormPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { accNo } = useParams();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(!!accNo);

  /** ✅ 숙소 상세 불러오기 (수정 모드일 때) */
  useEffect(() => {
    if (!accNo) return;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${API_SERVER_HOST}/api/adm/accommodations/edit/${accNo}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res?.data?.data;
        if (!data) throw new Error("숙소 정보를 불러올 수 없습니다.");

        form.setFieldsValue(data);
        setIsEdit(true);
      } catch (err) {
        console.error("숙소 조회 실패:", err);
        message.error("숙소 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [accNo, form]);

  /** ✅ 다음 주소 검색 */
  const handleSearchAddress = () => {
    if (!window.daum || !window.daum.Postcode) {
      const script = document.createElement("script");
      script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      script.onload = handleSearchAddress;
      document.head.appendChild(script);
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data) {
        const addr = data.address;
        form.setFieldsValue({ address: addr });
      },
    }).open();
  };

  /** ✅ 등록 / 수정 요청 */
  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem("accessToken");
      setLoading(true);

      if (isEdit) {
        await axios.put(`${API_SERVER_HOST}/api/adm/accommodations/edit/${accNo}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("숙소 정보가 수정되었습니다.");
      } else {
        await axios.post(`${API_SERVER_HOST}/api/adm/accommodations/new`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("새 숙소가 등록되었습니다.");
      }

      navigate("/adm/accommodations/list");
    } catch (err) {
      console.error("저장 실패:", err);
      message.error("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 8 }}>
      <Card
        style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
        title={
          <Space align="center">
            <Title level={4} style={{ margin: 0 }}>
              {isEdit ? "숙소 수정" : "숙소 등록"}
            </Title>
          </Space>
        }
        extra={
          <Button
            size="large"
            icon={<RollbackOutlined />}
            onClick={() => navigate("/adm/accommodations/list")}
          >
            목록으로
          </Button>
        }
      >
        {loading ? (
          <Spin tip="불러오는 중..." style={{ display: "block", marginTop: 50 }} />
        ) : (
          <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            initialValues={{
              checkInTime: "15:00",
              checkOutTime: "11:00",
              hasCooking: false,
              hasParking: false,
              active: true,
            }}
          >
            {/* 1행 — 숙소명 */}
            <Form.Item
              label="숙소명"
              name="title"
              rules={[{ required: true, message: "숙소명을 입력하세요" }]}
            >
              <Input placeholder="예: 제주 힐스테이" size="large" />
            </Form.Item>

            {/* 2행 — 전화번호 / 주소 */}
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="전화번호"
                  name="tel"
                  rules={[{ required: true, message: "전화번호를 입력하세요" }]}
                >
                  <Input placeholder="예: 064-123-4567" size="large" />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  label="주소"
                  name="address"
                  rules={[{ required: true, message: "주소를 입력하세요" }]}
                >
                  <Input.Group compact>
                    <Input
                      style={{ width: "calc(100% - 110px)" }}
                      placeholder="예: 제주특별자치도 제주시 애월읍 곽지리 123"
                      size="large"
                    />
                    <Button
                      type="primary"
                      icon={<EnvironmentOutlined />}
                      onClick={handleSearchAddress}
                      size="large"
                      style={{ width: 110 }}
                    >
                      주소찾기
                    </Button>
                  </Input.Group>
                </Form.Item>
              </Col>
            </Row>

            {/* 3행 — 체크인 / 체크아웃 */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="체크인" name="checkInTime">
                  <Input placeholder="15:00" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="체크아웃" name="checkOutTime">
                  <Input placeholder="11:00" size="large" />
                </Form.Item>
              </Col>
            </Row>

            {/* 4행 — 로컬 이미지 경로 */}
            <Form.Item
              label="로컬 이미지 경로"
              name="localImagePath"
              tooltip="서버에서 관리되는 로컬 이미지 경로입니다."
            >
              <Input placeholder="예: /uploads/hotel123.jpg" size="large" />
            </Form.Item>

            {/* 5행 — 숙소 설명 */}
            <Form.Item label="숙소 설명" name="overview">
              <Input.TextArea rows={4} placeholder="숙소에 대한 설명을 입력하세요" size="large" />
            </Form.Item>

            {/* 6행 — 스위치 + 버튼 한 줄 배치 */}
            <Row align="middle" justify="space-between" style={{ marginTop: 16 }}>
              {/* 왼쪽: 스위치 그룹 */}
              <Col>
                <Space size="large">
                  <Form.Item
                    label="취사 가능"
                    name="hasCooking"
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch checkedChildren="가능" unCheckedChildren="불가" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="주차 가능"
                    name="hasParking"
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch checkedChildren="가능" unCheckedChildren="불가" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="운영 여부"
                    name="active"
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch checkedChildren="운영중" unCheckedChildren="중단" size="large" />
                  </Form.Item>
                </Space>
              </Col>

              {/* 오른쪽: 버튼 그룹 */}
              <Col>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    size="large"
                    loading={loading}
                  >
                    {isEdit ? "수정하기" : "등록하기"}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default AdminAccFormPage;
