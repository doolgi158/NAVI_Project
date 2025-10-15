import { Form, Input, Button, Card, DatePicker, Select, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import MainLayout from "../../layout/MainLayout";
import { useUserDetailFunctions } from "@/common/hooks/useUserDetailFunctions";
import { useNavigate } from "react-router-dom";


const { Option } = Select;

const UserDetailPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const {
    user, editing, setEditing, loading, handleSave,
    handleDeleteAccount, handleProfileUpload, handleProfileDelete
  } = useUserDetailFunctions(form);

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

                  {/* 프로필 변경 & 편집 버튼 */}
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
                      onClick={() => document.getElementById("profileUpload").click()}
                    >
                      프로필 변경
                    </Button>

                    {/* 사용자가 직접 프로필 이미지를 설정한 경우에만 보임 */}
                    {user?.profile && (
                      <>
                        <Button
                          type="default"
                          className="text-sm border-gray-300 hover:border-indigo-400 hover:text-indigo-500 transition"
                          onClick={() =>
                            navigate("/users/profile/edit", {
                            state: { profileUrl: user.profile },
                          })}
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
                        {user?.local || "-"}
                      </div>
                    )}
                  </Form.Item>
                </Form>

                {/* 버튼 영역 */}
                <div className="flex justify-between items-center mt-8">
                  <Button danger onClick={handleDeleteAccount} className="hover:bg-red-50">
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