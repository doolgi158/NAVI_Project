import { useState, useEffect } from "react";
import {
    Form, Input, InputNumber, Button, Select, Switch, Upload,
    message, Card, TimePicker
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import { API_SERVER_HOST } from "@/common/api/naviApi";

const AdminAccommodationCreatePage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [townships, setTownships] = useState([]);
    const [fileList, setFileList] = useState([]);

    // 읍면동 리스트 로드
    const fetchTownships = async () => {
        try {
            const res = await axios.get(`${API_SERVER_HOST}/api/location/townships`);
            setTownships(res.data.data || []);
        } catch (err) {
            console.error("읍면동 목록 불러오기 실패:", err);
            message.error("지역 정보를 불러올 수 없습니다.");
        }
    };

    useEffect(() => {
        fetchTownships();
    }, []);

    // 사진 업로드 핸들러
    const handleUploadChange = ({ fileList }) => {
        setFileList(fileList);
    };

    // 폼 제출
    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");

            // multipart/form-data 생성
            const formData = new FormData();
            Object.entries(values).forEach(([key, val]) => {
                if (key === "checkInTime" || key === "checkOutTime") {
                    formData.append(key, dayjs(val).format("HH:mm"));
                } else {
                    formData.append(key, val);
                }
            });

            // 이미지 파일 추가
            if (fileList.length > 0) {
                fileList.forEach((file) => {
                    formData.append("images", file.originFileObj);
                });
            }

            // 서버 요청
            const res = await axios.post(`${API_SERVER_HOST}/api/adm/accommodations`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data.status === 200) {
                message.success("숙소가 성공적으로 등록되었습니다!");
                form.resetFields();
                setFileList([]);
            }
        } catch (err) {
            console.error("숙소 등록 실패:", err);
            message.error("숙소 등록에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminSiderLayout>
            <Card title="숙소 등록" style={{ margin: 24 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        hasCooking: false,
                        hasParking: false,
                        active: true,
                        checkInTime: dayjs("15:00", "HH:mm"),
                        checkOutTime: dayjs("11:00", "HH:mm"),
                    }}
                >
                    <Form.Item label="숙소명" name="title" rules={[{ required: true }]}>
                        <Input placeholder="예: 제주 호텔 나비" />
                    </Form.Item>

                    <Form.Item label="카테고리" name="category" rules={[{ required: true }]}>
                        <Select
                            options={[
                                { value: "호텔", label: "호텔" },
                                { value: "펜션", label: "펜션" },
                                { value: "모텔", label: "모텔" },
                                { value: "게스트하우스", label: "게스트하우스" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item label="전화번호" name="tel">
                        <Input placeholder="064-123-4567" />
                    </Form.Item>

                    <Form.Item label="주소" name="address" rules={[{ required: true }]}>
                        <Input placeholder="제주특별자치도 제주시 ..." />
                    </Form.Item>

                    <Form.Item label="위도 (mapy)" name="mapy">
                        <InputNumber step={0.000001} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item label="경도 (mapx)" name="mapx">
                        <InputNumber step={0.000001} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item label="숙소 설명" name="overview">
                        <Input.TextArea rows={4} placeholder="숙소에 대한 설명을 입력하세요." />
                    </Form.Item>

                    <Form.Item label="체크인 시간" name="checkInTime">
                        <TimePicker format="HH:mm" />
                    </Form.Item>

                    <Form.Item label="체크아웃 시간" name="checkOutTime">
                        <TimePicker format="HH:mm" />
                    </Form.Item>

                    <Form.Item label="취사 가능" name="hasCooking" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item label="주차 가능" name="hasParking" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item label="운영 여부" name="active" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item label="읍면동 선택" name="townshipId" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            placeholder="읍면동을 선택하세요"
                            optionFilterProp="label"
                            options={townships.map((t) => ({
                                value: t.townshipId,
                                label: `${t.sigunguName} ${t.townshipName}`,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item label="숙소 사진 업로드" name="images">
                        <Upload
                            multiple
                            listType="picture"
                            beforeUpload={() => false}
                            fileList={fileList}
                            onChange={handleUploadChange}
                        >
                            <Button icon={<UploadOutlined />}>사진 선택</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            등록
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </AdminSiderLayout>
    );
};

export default AdminAccommodationCreatePage;