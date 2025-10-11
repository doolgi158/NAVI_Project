import { useEffect, useRef, useState } from "react";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { setlogout } from "../slice/loginSlice";
import { useNavigate } from "react-router-dom";

const UserMenuDropdown = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loginstate = useSelector((state) => state.login);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (path) => {
    setMenuOpen(false);
    if (path === "logout") {
      dispatch(setlogout());
      navigate("/");
    } else {
      navigate(path);
    }
  };

  return (
    <div
      ref={menuRef}
      className="relative inline-block" // ✅ 핵심: Space 대신 inline-block으로 고정
      style={{ lineHeight: 0 }}
    >
      {/* 프로필 버튼 */}
      <Avatar
        src={loginstate.user?.profileImage || null}
        icon={!loginstate.user?.profileImage && <UserOutlined />}
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
              onClick={() => handleMenuClick("/users/mypage")}
            >
              마이페이지
            </li>

            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleMenuClick("/users/my-plans")}
            >
              나의 여행계획
            </li>

            <div className="py-1">
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleMenuClick("/users/my-accommodations")}
              >
                숙소 예약 현황
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleMenuClick("/users/my-deliveries")}
              >
                짐 배송 예약 현황
              </li>
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