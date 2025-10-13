import { useState, useEffect } from "react";
import axios from "axios";
import { API_SERVER_HOST } from "../../../common/api/naviApi";
import { Button, Upload, message, Avatar, Form, Input, Tabs } from "antd";
import { UploadOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";

const UserMyPage = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  // 사용자 정보 불러오기
  useEffect(() => {
    axios.get(`${API_SERVER_HOST}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
      .then(res => {
        setUser(res.data.data);
      })
      .catch(() => message.error("사용자 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  // 프로필 업로드
  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API_SERVER_HOST}/api/users/profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser({ ...user, profile: res.data.data });
      message.success("프로필 사진이 변경되었습니다!");
    } catch {
      message.error("업로드 실패");
    }
  };

  // 프로필 삭제
  const handleDeleteProfile = async () => {
    await axios.delete(`${API_SERVER_HOST}/api/users/profile`);
    setUser({ ...user, profile: null });
    message.success("프로필 사진이 삭제되었습니다!");
  };

  // 비밀번호 변경
  const handlePasswordChange = async (values) => {
    try {
      await axios.put(`${API_SERVER_HOST}/api/users/password`, values);
      message.success("비밀번호가 변경되었습니다!");
    } catch {
      message.error("비밀번호 변경 실패");
    }
  };

  const infoTab = (
    <div className="space-y-3 text-gray-700">
      <div><b>이름:</b> {user?.name}</div>
      <div><b>이메일:</b> {user?.email}</div>
      <div><b>전화번호:</b> {user?.phone}</div>
      <div><b>생년월일:</b> {user?.birth}</div>
      <div><b>성별:</b> {user?.gender}</div>
      <div><b>국가:</b> {user?.local}</div>
      <div><b>가입일:</b> {user?.signUp}</div>
    </div>
  );

  const profileTab = (
    <div className="flex flex-col items-center space-y-3">
      <Avatar size={128} src={user?.profile} icon={<UserOutlined />}/>
      <Upload customRequest={handleUpload} showUploadList={false}>
        <Button icon={<UploadOutlined />}>프로필 변경</Button>
      </Upload>
      {user.profile && (
        <Button danger icon={<DeleteOutlined />} onClick={handleDeleteProfile}>
          프로필 삭제
        </Button>
      )}
    </div>
  );

  const securityTab = (
    <Form onFinish={handlePasswordChange} className="w-80">
      <Form.Item name="oldPassword" rules={[{ required: true, message: "현재 비밀번호를 입력하세요." }]}>
        <Input.Password placeholder="현재 비밀번호" />
      </Form.Item>
      <Form.Item name="newPassword" rules={[{ required: true, message: "새 비밀번호를 입력하세요." }]}>
        <Input.Password placeholder="새 비밀번호" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          비밀번호 변경
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl font-bold mb-5">내 정보</h2>
      <Tabs
        defaultActiveKey="1"
        items={[
          { key: "1", label: "기본 정보", children: infoTab },
          { key: "2", label: "프로필 관리", children: profileTab },
          { key: "3", label: "보안 설정", children: securityTab },
        ]}
      />
    </div>
  );
};

export default UserMyPage;