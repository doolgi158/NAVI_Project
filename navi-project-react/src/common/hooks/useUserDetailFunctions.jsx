import { useState, useEffect } from "react";
import axios from "axios";
import { API_SERVER_HOST } from "../api/naviApi";
import dayjs from "dayjs";
import { message, Modal } from "antd";
import { resizeImage } from "@/common/util/resizeImage";

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

  // 사용자 정보 불러오기
  useEffect(() => {
    axios
      .get(`${API_SERVER_HOST}/api/users/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      })
      .then((res) => {
        const data = res.data.data;
        setUser({
          ...data,
          profile: data.profile ? `${API_SERVER_HOST}${data.profile}` : null,
        });

        form.setFieldsValue({
          name: data.name,
          phone: data.phone,
          birth: dayjs(data.birth),
          email: data.email,
          gender: data.gender,
          local: data.local,
        });
      })
      .catch(() => message.error("사용자 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
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
      setUser(payload);
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
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: { newProfile: newPath } }));

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
          window.dispatchEvent(new CustomEvent("profile-updated", { detail: { newProfile: null } }));

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
    confirm({
      title: "정말 탈퇴하시겠습니까?",
      icon: null,
      content: "탈퇴 시 계정 정보 및 데이터가 모두 삭제됩니다.",
      okText: "탈퇴하기",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        try {
          await axios.delete(`${API_SERVER_HOST}/api/users/me`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          });
          localStorage.removeItem("accessToken");
          message.success("회원 탈퇴가 완료되었습니다.");
          window.location.href = "/";
        } catch (err) {
          message.error("회원 탈퇴 중 오류가 발생했습니다.");
        }
      },
    });
  };

  return {
    user, setUser, editing, setEditing, loading, uploading,
    handleSave, handleProfileUpload, handleDeleteAccount, handleProfileDelete,
  };
};