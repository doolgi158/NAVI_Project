import { useState, useEffect } from "react";
import axios from "axios";
import { API_SERVER_HOST } from "../../../common/api/naviApi";
import { Form, Input, Button, Card, message, DatePicker, Select, Avatar,
  Upload, Modal } from "antd";
import { UploadOutlined, UserOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import MainLayout from "../../layout/MainLayout";

const { Option } = Select;
const { confirm } = Modal;

const UserDetailPage = () => {
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 사용자 정보 불러오기
  useEffect(() => {
    axios
      .get(`${API_SERVER_HOST}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        setUser(res.data.data);
        form.setFieldsValue({
          name: res.data.data.name,
          phone: res.data.data.phone,
          birth: dayjs(res.data.data.birth),
          email: res.data.data.email,
          gender: res.data.data.gender,
          local: res.data.data.local,
        });
      })
      .catch(() => message.error("사용자 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [form]);

  // 회원 정보 수정 저장
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        birth: values.birth ? values.birth.format("YYYY-MM-DD") : "",
      };

      await axios.put(`${API_SERVER_HOST}/api/users/me`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      message.success("회원 정보가 수정되었습니다!");
      setEditing(false);
      setUser(payload);
    } catch (err) {
      console.error(err);
      message.error("수정 중 오류가 발생했습니다.");
    }
  };

  // 프로필 이미지 업로드
  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await axios.post(`${API_SERVER_HOST}/api/users/me/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setUser((prev) => ({ ...prev, profile: res.data.url }));
      message.success("프로필 이미지가 변경되었습니다!");
    } catch (err) {
      message.error("이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  // 회원탈퇴
  const handleDeleteAccount = () => {
    confirm({
      title: "정말 탈퇴하시겠습니까?",
      icon: <ExclamationCircleFilled />,
      content: "탈퇴 시 계정 정보 및 데이터가 모두 삭제됩니다.",
      okText: "탈퇴하기",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        try {
          await axios.delete(`${API_SERVER_HOST}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });
          localStorage.removeItem("accessToken");
          message.success("회원 탈퇴가 완료되었습니다.");
          window.location.href = "/"; // 홈으로 이동
        } catch (err) {
          message.error("회원 탈퇴 중 오류가 발생했습니다.");
        }
      },
    });
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center min-h-screen bg-[#FAF9F7] py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-3xl"
        >
          <Card
            loading={loading}
            title={<span className="text-2xl font-semibold">내 정보 관리</span>}
            className="rounded-2xl shadow-md border border-gray-100 bg-white"
            bodyStyle={{ padding: "2rem" }}
          >
            {user && (
              <>
                {/* 프로필 이미지 섹션 */}
                <div className="flex flex-col items-center mb-8">
                  <Avatar
                    size={120}
                    src={user?.profile}
                    icon={<UserOutlined />}
                    className="shadow-md ring-2 ring-indigo-200 mb-4"
                  />
                  <Upload
                    showUploadList={false}
                    customRequest={handleUpload}
                    accept="image/*"
                    disabled={uploading}
                  >
                    <Button icon={<UploadOutlined />} loading={uploading}>
                      {uploading ? "업로드 중..." : "프로필 변경"}
                    </Button>
                  </Upload>
                </div>

                {/* 사용자 정보 폼 */}
                <Form
                form={form}
                layout="vertical"
                className="space-y-4"
                >
                {/* 이름 */}
                <Form.Item label="이름" name="name">
                    {editing ? (
                    <Input placeholder="이름 입력" />
                    ) : (
                    <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                        {user?.name || "-"}
                    </div>
                    )}
                </Form.Item>

                {/* 전화번호 */}
                <Form.Item label="전화번호" name="phone">
                    {editing ? (
                    <Input placeholder="01012345678" />
                    ) : (
                    <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                        {user?.phone || "-"}
                    </div>
                    )}
                </Form.Item>

                {/* 생년월일 */}
                <Form.Item label="생년월일" name="birth">
                    {editing ? (
                    <DatePicker
                        className="w-full"
                        format="YYYY-MM-DD"
                        disabledDate={(date) => date.isAfter(dayjs())}
                    />
                    ) : (
                    <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                        {user?.birth || "-"}
                    </div>
                    )}
                  </Form.Item>

                {/* 이메일 */}
                <Form.Item label="이메일" name="email">
                    {editing ? (
                    <Input placeholder="example@email.com" />
                    ) : (
                    <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                        {user?.email || "-"}
                    </div>
                    )}
                </Form.Item>

                {/* 성별 */}
                <Form.Item label="성별" name="gender">
                    {editing ? (
                    <Select placeholder="성별 선택">
                        <Option value="M">남성</Option>
                        <Option value="F">여성</Option>
                    </Select>
                    ) : (
                    <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                        {user?.gender === "M" ? "남성" : user?.gender === "F" ? "여성" : "-"}
                    </div>
                    )}  
                </Form.Item>

                {/* 내/외국인 */}
                <Form.Item label="내/외국인" name="local">
                    {editing ? (
                    <Select placeholder="국적 선택">
                        <Option value="L">내국인</Option>
                        <Option value="F">외국인</Option>
                    </Select>
                    ) : (
                    <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                        {user?.local || "-"}
                    </div>
                    )}
                </Form.Item>
                </Form>

                {/* 버튼 영역 */}
                <div className="flex justify-between items-center mt-8">
                    <Button
                        danger
                        onClick={handleDeleteAccount}
                        className="hover:bg-red-50"
                    >
                        회원 탈퇴
                    </Button>

                    <div className="flex gap-3">
                        {!editing ? (
                        <Button
                            type="primary"
                            onClick={() => setEditing(true)}
                            className="bg-indigo-500 hover:bg-indigo-600"
                        >
                            수정하기
                        </Button>
                        ) : (
                        <>
                            <Button onClick={() => setEditing(false)}>취소</Button>
                            <Button
                                type="primary"
                                onClick={handleSave}
                                className="bg-indigo-500 hover:bg-indigo-600"
                            >
                                저장
                            </Button>
                        </>
                        )}
                    </div>
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default UserDetailPage;
