import { useState, useEffect } from "react";
import axios from "axios";
import { API_SERVER_HOST } from "../../../common/api/naviApi";
import { Button, Avatar, Card, message, Skeleton } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import MainLayout from "../../layout/MainLayout";
import { useNavigate } from "react-router-dom";

const UserMyPage = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_SERVER_HOST}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        const data = res.data.data;

        setUser({
          ...data,
          // 프로필 경로를 절대경로로 변환
          profile: data.profile ? `${API_SERVER_HOST}${data.profile}` : null,
        });
      })
      .catch(() => message.error("사용자 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center w-full bg-[#FAF9F7] min-h-screen py-10 px-4">
        {/* ✅ 상단 사용자 정보 카드 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-5xl"
        >
          <Card
            loading={loading}
            className="rounded-2xl shadow-md border border-gray-100 bg-white mb-10"
            bodyStyle={{ padding: "2rem" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Avatar
                  size={96}
                  src={user?.profile || null}
                  icon={!user?.profile && <UserOutlined />}
                  className="shadow-lg ring-2 ring-indigo-200"
                />
                <div>
                  <h2
                    className="text-2xl font-semibold text-gray-800 cursor-pointer hover:text-indigo-500 transition-colors"
                    onClick={() => navigate("/users/detail")}
                  >
                    {user?.name || "사용자"} 님
                  </h2>
                  <p className="text-gray-500">{user?.email}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    가입일: {user?.signUp || "-"}
                  </p>
                </div>
              </div>

              {/* 요약 통계 */}
              <div className="flex gap-8 text-center">
                <div>
                  <p className="text-gray-500 text-sm">예약</p>
                  <p className="text-lg font-bold text-indigo-500">0</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">결제</p>
                  <p className="text-lg font-bold text-indigo-500">0</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ✅ 하단 섹션: 카드 리스트 */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "❤️ 좋아요한 여행지", desc: "마음에 든 여행지를 다시 보기", link: "/users/likes" },
            { title: "🔖 북마크한 여행지", desc: "나중에 갈 여행지 모아보기", link: "/users/bookmarks" },
            { title: "🗺️ 여행 계획", desc: "계획 중인 여행 일정입니다.", link: "/users/plans" },
            { title: "📅 예약 현황", desc: "다가올 여행 일정을 확인하세요.", link: "/users/reservations" },
            { title: "💳 결제 내역", desc: "결제한 여행 내역을 한눈에.", link: "/users/payments" },
            { title: "📝 내 게시글", desc: "작성한 게시글 목록입니다.", link: "/users/posts" },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={i}
              className="w-full"
            >
              <Card
                className="rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all bg-white h-full"
                bodyStyle={{ padding: "1.25rem 1.5rem" }}
                title={<span className="text-base font-semibold text-gray-700">{item.title}</span>}
                extra={
                  <Button
                    type="link"
                    className="text-indigo-500 hover:text-indigo-600"
                    onClick={() => navigate(item.link)}
                  >
                    보기
                  </Button>
                }
              >
                <Skeleton active loading={loading} paragraph={{ rows: 1 }}>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </Skeleton>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserMyPage;
