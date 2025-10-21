import {
  Form, Input, Button, Card, DatePicker, Select,
  Avatar, Modal, message
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import MainLayout from "../../layout/MainLayout";
import { useUserDetailFunctions } from "@/common/hooks/useUserDetailFunctions";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const { Option } = Select;

const UserDetailPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStep, setPasswordStep] = useState("verify"); // "verify" → "change"
  const [verifiedPw, setVerifiedPw] = useState(null); // 검증된 현재 비밀번호 저장

  const { user, editing, setEditing, loading, handleSave, handleDeleteAccount, handleProfileUpload,
    handleProfileDelete, checkPassword, handlePasswordChange } = useUserDetailFunctions(form);

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
                <div className="flex flex-col items-center">
                  <Avatar
                    size={96}
                    src={user?.profile || null}
                    icon={!user?.profile && <UserOutlined />}
                    className="shadow-lg ring-2 ring-indigo-200"
                  />

                  <div className="flex gap-3 mt-3">
                    <input
                      type="file"
                      accept="image/*"
                      id="profileUpload"
                      className="hidden"
                      onChange={(e) => handleProfileUpload(e.target.files[0])}
                    />
                    <Button
                      type="default"
                      className="text-sm border-gray-300 hover:border-indigo-400 hover:text-indigo-500 transition"
                      onClick={() =>
                        document.getElementById("profileUpload").click()
                      }
                    >
                      프로필 변경
                    </Button>

                    {user?.profile && (
                      <>
                        <Button
                          type="default"
                          className="text-sm border-gray-300 hover:border-indigo-400 hover:text-indigo-500 transition"
                          onClick={() =>
                            navigate("/users/profile/edit", {
                              state: { profileUrl: user.profile },
                            })
                          }
                        >
                          프로필 편집
                        </Button>
                        <Button
                          danger
                          className="text-sm border-gray-300 hover:border-red-400 hover:text-red-500 transition"
                          onClick={handleProfileDelete}
                        >
                          프로필 삭제
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* 사용자 정보 폼 */}
                <Form form={form} layout="vertical" className="space-y-4 mt-6">
                  <Form.Item label="이름" name="name">
                    {editing ? (
                      <Input placeholder="이름 입력" />
                    ) : (
                      <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                        {user?.name || "-"}
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item label="전화번호" name="phone">
                    {editing ? (
                      <Input placeholder="01012345678" />
                    ) : (
                      <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                        {user?.phone || "-"}
                      </div>
                    )}
                  </Form.Item>

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

                  <Form.Item label="이메일" name="email">
                    {editing ? (
                      <Input placeholder="example@email.com" />
                    ) : (
                      <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                        {user?.email || "-"}
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item label="성별" name="gender">
                    {editing ? (
                      <Select placeholder="성별 선택">
                        <Option value="M">남성</Option>
                        <Option value="F">여성</Option>
                      </Select>
                    ) : (
                      <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                        {user?.gender === "M"
                          ? "남성"
                          : user?.gender === "F"
                            ? "여성"
                            : "-"}
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item label="내/외국인" name="local">
                    {editing ? (
                      <Select placeholder="국적 선택">
                        <Option value="L">내국인</Option>
                        <Option value="F">외국인</Option>
                      </Select>
                    ) : (
                      <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                        {user?.local === "L"
                          ? "내국인"
                          : user?.local === "F"
                            ? "외국인"
                            : "-"}
                      </div>
                    )}
                  </Form.Item>
                </Form>

                {/* 버튼 영역 */}
                <div className="flex justify-between items-center mt-8">
                  <div className="flex gap-3">
                    <Button
                      danger
                      onClick={handleDeleteAccount}
                      className="hover:bg-red-50"
                    >
                      회원 탈퇴
                    </Button>
                    <Button
                      onClick={() => setPasswordModalOpen(true)}
                      className="border-gray-300 hover:border-indigo-400 hover:text-indigo-500 transition"
                    >
                      비밀번호 변경
                    </Button>
                  </div>

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

      {/* 비밀번호 변경 모달 */}
      <Modal
        title="비밀번호 변경"
        open={isPasswordModalOpen}
        onCancel={() => {
          setPasswordModalOpen(false);
          setPasswordStep("verify");
          setVerifiedPw(null);
          passwordForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={async (values) => {
            if (passwordStep === "verify") {
              // 현재 비밀번호 확인 단계
              setPasswordLoading(true);
              const valid = await checkPassword(values.currentPw);
              setPasswordLoading(false);

              if (valid) {
                message.success("비밀번호 확인이 완료되었습니다.");
                setVerifiedPw(values.currentPw);
                setPasswordStep("change"); // 다음 단계로 전환
                passwordForm.resetFields();
              } else {
                message.error("비밀번호가 일치하지 않습니다.");
              }
            } else {
              // 새 비밀번호 변경 단계
              setPasswordLoading(true);
              const success = await handlePasswordChange(
                verifiedPw,
                values.newPw,
                values.confirmPw
              );
              setPasswordLoading(false);

              if (success) {
                setPasswordModalOpen(false);
                setPasswordStep("verify");
                setVerifiedPw(null);
                passwordForm.resetFields();
              }
            }
          }}
        >
          {passwordStep === "verify" ? (
            // STEP 1: 현재 비밀번호 입력
            <>
              <Form.Item
                label="현재 비밀번호"
                name="currentPw"
                rules={[{ message: "현재 비밀번호를 입력하세요." }]}
              >
                <Input.Password placeholder="현재 비밀번호" />
              </Form.Item>

              <div className="flex justify-end gap-3 mt-4">
                <Button onClick={() => setPasswordModalOpen(false)}>취소</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={passwordLoading}
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  다음
                </Button>
              </div>
            </>
          ) : (
            // STEP 2: 새 비밀번호 입력
            <>
              <Form.Item
                label="새 비밀번호"
                name="newPw"
                rules={[
                  { message: "새 비밀번호를 입력하세요." },
                  { min: 8, message: "비밀번호는 8자 이상이어야 합니다." },
                  {
                    pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
                    message: "영문, 숫자, 특수문자를 모두 포함해야 합니다.",
                  },
                ]}
              >
                <Input.Password placeholder="새 비밀번호" />
              </Form.Item>

              <Form.Item
                label="비밀번호 확인"
                name="confirmPw"
                dependencies={["newPw"]}
                rules={[
                  { message: "비밀번호 확인을 입력하세요." },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPw") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("비밀번호가 일치하지 않습니다.")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="비밀번호 확인" />
              </Form.Item>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  onClick={() => {
                    setPasswordStep("verify");
                    setVerifiedPw(null);
                    passwordForm.resetFields();
                  }}
                >
                  이전
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={passwordLoading}
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  변경하기
                </Button>
              </div>
            </>
          )}
        </Form>
      </Modal>
    </MainLayout>
  )
};

export default UserDetailPage;
