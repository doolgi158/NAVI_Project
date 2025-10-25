import React, { useState } from "react";
import { Modal, Input, Checkbox, List, message } from "antd";
import axios from "axios";

const { TextArea } = Input;
const API_SERVER_HOST = "http://localhost:8080";

const RefundModal = ({ open, onClose, merchantId, details = [], onSuccess }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleSelect = (reserveId) => {
    setSelectedIds((prev) =>
      prev.includes(reserveId)
        ? prev.filter((id) => id !== reserveId)
        : [...prev, reserveId]
    );
  };

  const handleConfirm = async () => {
    if (!reason.trim()) return message.warning("환불 사유를 입력하세요.");
    if (selectedIds.length === 0)
      return message.warning("환불할 예약을 선택하세요.");

    Modal.confirm({
      title: "부분 환불 확인",
      content: (
        <div>
          <p>선택된 예약: {selectedIds.join(", ")}</p>
          <p>사유: {reason}</p>
        </div>
      ),
      okText: "네, 환불합니다",
      cancelText: "취소",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("accessToken");
          for (const reserveId of selectedIds) {
            await axios.post(
              `${API_SERVER_HOST}/api/adm/payment/refund/detail`,
              null,
              {
                params: { merchantId, reason: `[부분환불] ${reason}` },
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          }
          message.success("부분 환불이 완료되었습니다.");
          onClose();
          onSuccess?.();
        } catch (err) {
          console.error("❌ 부분 환불 실패:", err);
          message.error("부분 환불 처리 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Modal
      open={open}
      title="부분 환불 처리"
      okText="확인"
      cancelText="취소"
      confirmLoading={loading}
      onCancel={onClose}
      onOk={handleConfirm}
    >
      <p>아래에서 환불할 예약을 선택하세요:</p>
      <List
        dataSource={details}
        renderItem={(item) => (
          <List.Item>
            <Checkbox
              checked={selectedIds.includes(item.reserveId)}
              onChange={() => toggleSelect(item.reserveId)}
            >
              {item.reserveId} — ₩{item.amount?.toLocaleString()}
            </Checkbox>
          </List.Item>
        )}
      />
      <TextArea
        rows={3}
        placeholder="환불 사유를 입력하세요"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
    </Modal>
  );
};

export default RefundModal;
