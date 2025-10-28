import { useState, useEffect } from "react";
import axios from "axios";
import { API_SERVER_HOST } from "../api/naviApi";
import dayjs from "dayjs";
import { Input, message, Modal } from "antd";
import { resizeImage } from "@/common/util/resizeImage";
import { useDispatch } from "react-redux";
import { setProfileUrl } from "../slice/loginSlice";

const { confirm } = Modal;

/**
 * 사용자 상세 페이지용 로직 훅
 * @param {object} form - Antd Form 인스턴스
 */
export const useUserDetailFunctions = (form) => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 기본 유저 정보
        const res = await axios.get(`${API_SERVER_HOST}/api/users/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        const data = res.data.data;

        // 프로필 이미지 별도 조회
        const imgRes = await axios.get(`${API_SERVER_HOST}/api/images`, {
          params: {
            targetType: "USER",
            targetId: localStorage.getItem("username"),
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });

        const userImage = imgRes.data.data?.[0]?.path
          ? `${API_SERVER_HOST}${imgRes.data.data[0].path}?t=${Date.now()}`
          : null;

        // 상태 세팅
        setUser({ ...data, profile: userImage });
        form.setFieldsValue({
          name: data.name,
          phone: data.phone,
          birth: dayjs(data.birth),
          email: data.email,
          gender: data.gender,
          local: data.local,
        });
      } catch (err) {
        console.error(err);
        message.error("사용자 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [form]);

  // 회원정보 수정 저장
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        birth: values.birth ? values.birth.format("YYYY-MM-DD") : "",
      };

      await axios.put(`${API_SERVER_HOST}/api/users/me`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      message.success("회원 정보가 수정되었습니다!");
      setEditing(false);
      setUser((prev) => ({ ...prev, ...payload, profile: prev.profile, }));
    } catch (err) {
      console.error(err);
      message.error("수정 중 오류가 발생했습니다.");
    }
  };

  // 프로필 업로드
  const handleProfileUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      message.warning("이미지 용량이 너무 큽니다 (10MB 이하만 업로드 가능)");
      return;
    }

    setUploading(true);
    try {
      const resizedFile = await resizeImage(file, 300, 300);
      const formData = new FormData();
      formData.append("file", resizedFile);
      formData.append("targetType", "USER");
      formData.append("targetId", localStorage.getItem("username"));

      const res = await axios.post(`${API_SERVER_HOST}/api/images/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const newPath = res.data.data.path;
      const newProfileUrl = `${API_SERVER_HOST}${newPath}?t=${Date.now()}`;

      setUser((prev) => ({ ...prev, profile: newProfileUrl }));
      dispatch(setProfileUrl(newProfileUrl));

      message.success("프로필이 변경되었습니다!");
    } catch (err) {
      console.error(err);
      message.error("프로필 업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  // 프로필 삭제
  const handleProfileDelete = () => {
    confirm({
      title: "프로필 이미지를 삭제하시겠습니까?",
      content: "삭제 후에는 기본 프로필 이미지로 변경됩니다.",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      async onOk() {
        try {
          await axios.delete(`${API_SERVER_HOST}/api/images/delete`, {
            params: {
              targetType: "USER",
              targetId: localStorage.getItem("username"),
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });

          // 로컬 상태 업데이트
          setUser((prev) => ({ ...prev, profile: null }));
          dispatch(setProfileUrl(null));

          message.success("프로필 이미지가 삭제되었습니다.");
        } catch (err) {
          console.error(err);
          message.error("프로필 삭제 중 오류가 발생했습니다.");
        }
      },
    });
  };

  // 회원탈퇴
  const handleDeleteAccount = () => {
    Modal.confirm({
      title: "회원 탈퇴",
      content: "탈퇴 사유를 입력하시겠습니까?",
      okText: "예",
      cancelText: "아니오",
      async onOk() {
        // 예를 누른 경우 → 사유 입력창 띄우기
        let reason = "";
        Modal.confirm({
          title: "탈퇴 사유를 입력해주세요",
          content: (
            <Input.TextArea
              rows={4}
              placeholder="탈퇴 이유를 입력하세요 (선택사항)"
              onChange={(e) => {
                reason = e.target.value;
              }}
            />
          ),
          okText: "탈퇴하기",
          okType: "danger",
          cancelText: "취소",
          async onOk() {
            await withdrawRequest(reason);
          },
        });
      },
      async onCancel() {
        // 아니오를 누른 경우 → 바로 탈퇴 처리
        await withdrawRequest(null);
      },
    });

    // 실제 서버 요청 함수
    const withdrawRequest = async (reason) => {
      try {
        await axios.post(
          `${API_SERVER_HOST}/api/users/delete`,
          { reason },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );
        message.success("회원 탈퇴가 완료되었습니다.");
        localStorage.removeItem("accessToken");
        window.location.href = "/";
      } catch (err) {
        console.error(err);
        message.error("회원 탈퇴 중 오류가 발생했습니다.");
      }
    };
  };

  // 비밀번호 확인
  const checkPassword = async (currentPw) => {
    try {
      const res = await axios.post(
        `${API_SERVER_HOST}/api/users/check-password`,
        { currentPw },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return res?.data?.data?.valid === true;
    } catch (err) {
      message.error("비밀번호 확인 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async (currentPw, newPassword, confirmPw) => {
    if (newPassword !== confirmPw) {
      message.error("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return false;
    }

    try {
      await axios.put(
        `${API_SERVER_HOST}/api/users/change-password`,
        { currentPw, newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      message.success("비밀번호가 변경되었습니다!");
      return true;
    } catch (err) {
      if (err.response?.status === 400)
        message.error("현재 비밀번호가 일치하지 않습니다.");
      else if (err.response?.status === 401) {
        message.error("세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      } else message.error("비밀번호 변경 중 오류가 발생했습니다.");
      return false;
    }
  };

  return {
    user, setUser, editing, setEditing, loading, uploading, checkPassword,
    handleSave, handleProfileUpload, handleDeleteAccount, handleProfileDelete,
    handlePasswordChange
  };
};