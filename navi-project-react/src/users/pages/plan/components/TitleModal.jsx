import React from "react";
import { Modal, Input, Button, message } from "antd";

export default function TitleModal({ open, title, setTitle, setStep }) {
  return (
    <Modal open={open} centered closable={false} footer={null} width="60%"
      styles={{ body: { background: "#fff", borderRadius: 18, padding: 50, textAlign: "center" } }}>
      <h2 className="text-[#2F3E46] text-2xl font-bold mb-8">✏️ 여행 제목을 입력하세요</h2>
      <Input
        placeholder="예: 가족과 함께하는 오사카 여행"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        size="large"
        style={{ width: "80%", height: 52, fontSize: 17, borderRadius: 12, borderColor: "#DADADA" }}
      />
      <div className="mt-10 flex justify-center gap-6">
        <Button size="large" onClick={() => setStep(1)} style={{ background: "#ECECEC", color: "#2F3E46", borderRadius: 10 }}>
          이전
        </Button>
        <Button
          type="primary"
          size="large"
          style={{ background: "#2F3E46", borderRadius: 10 }}
          onClick={() => {
            if (!title.trim()) return message.warning("여행 제목을 입력해주세요!");
            setStep(3);
          }}
        >
          다음
        </Button>
      </div>
    </Modal>
  );
}
