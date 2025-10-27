import { useEffect, useRef, useState } from "react";
import { Avatar } from "antd";
import { DownOutlined, UpOutlined, UserOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { setlogout } from "../slice/loginSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_SERVER_HOST } from "../api/naviApi";

const UserMenuDropdown = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openGroup, setOpenGroup] = useState(false);

  // loginstate 기본값 방어
  const loginstate = useSelector((state) => state.login) || {};
  const user = loginstate?.user || {};

  const [profileUrl, setProfileUrl] = useState(null);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      axios
        .get(`${API_SERVER_HOST}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const data = res.data.data;
          if (data?.profile) {
            setProfileUrl(`${API_SERVER_HOST}${data.profile}`);
          }
        })
        .catch(() => {
          console.warn("프로필 이미지 불러오기 실패");
        });
    }

    // 프로필 변경 이벤트 감지
    const handleProfileUpdate = (e) => {
      if (e.detail?.newProfile) {
        setProfileUrl(`${API_SERVER_HOST}${e.detail.newProfile}?t=${Date.now()}`);
      }
    };
    window.addEventListener("profile-updated", handleProfileUpdate);

    // 외부 클릭 닫기
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, []);

  const handleMenuClick = (path) => {
    setMenuOpen(false);
    if (path === "logout") {
      dispatch(setlogout());
      setProfileUrl(null);
      navigate("/");
    } else {
      navigate(path);
    }
  };

  return (
    <div
      ref={menuRef}
      className="relative inline-block" // 핵심: Space 대신 inline-block으로 고정
      style={{ lineHeight: 0 }}
    >
      {/* 프로필 버튼 */}
      <Avatar
        src={profileUrl || loginstate?.user?.profileImage || null}
        icon={!profileUrl && !loginstate?.user?.profileImage && <UserOutlined />}
        size={38}
        className="cursor-pointer border border-gray-200 shadow-sm hover:shadow-md transition-transform hover:scale-105"
        onClick={() => setMenuOpen((prev) => !prev)}
      />

      {/* ▼ 드롭다운 메뉴 */}
      {menuOpen && (
        <div
          className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-[1001] text-sm"
          style={{
            animation: "fadeIn 0.15s ease-in-out",
          }}
        >
          <ul className="text-gray-700 py-1 divide-y divide-gray-100">
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleMenuClick("/users/detail")}
            >
              마이페이지
            </li>
            <div className="py-1">
              <div className="py-1">
                <div className="px-4 py-2 font-semibold text-gray-800">내 활동</div>
                <div className="border-t border-gray-300 border-dashed mx-4 my-1"></div>

                <ul>
                  <li
                    className="pl-8 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleMenuClick("/users/bookmarks")}
                  >
                    북마크
                  </li>
                  <li
                    className="pl-8 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleMenuClick("/users/likes")}
                  >
                    좋아요
                  </li>
                  <li
                    className="pl-8 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleMenuClick("/plans")}
                  >
                    여행계획
                  </li>
                </ul>
              </div>
            </div>
            <div className="py-1">
              <div
                className="px-4 py-2 font-semibold flex items-center justify-between"
                onClick={() => setOpenGroup(!openGroup)}
              >
                <span>예약 현황</span>
              </div>
              <div className="border-t border-gray-300 border-dashed mx-4 my-1"></div>
              <div className="transition-all">
                <li
                  className="pl-8 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleMenuClick("/users/my-accommodations")}
                >
                  숙소 예약
                </li>
                <li
                  className="pl-8 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleMenuClick("/users/my-flights")}
                >
                  항공편 예약
                </li>
                <li
                  className="pl-8 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleMenuClick("/users/my-deliveries")}
                >
                  짐 배송 예약
                </li>
              </div>
            </div>

            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleMenuClick("/users/my-payments")}
            >
              결제 현황
            </li>

            <li
              className="px-4 py-2 hover:bg-red-50 text-red-600 font-medium cursor-pointer rounded-b-md"
              onClick={() => handleMenuClick("logout")}
            >
              로그아웃
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMenuDropdown;