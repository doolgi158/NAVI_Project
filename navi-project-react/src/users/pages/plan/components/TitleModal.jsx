import React from "react";
import { Modal, Input, Button, message } from "antd";

/**
 * TitleModal
 * - Planner 단계용 (isEditMode=false): step 1 → step 3 이동
 * - Scheduler 수정용 (isEditMode=true): 제목 수정 후 닫기만
 */
export default function TitleModal({ open, title, setTitle, setStep, isEditMode = false }) {
  const handleConfirm = () => {
    if (!title.trim()) {
      message.warning("여행 제목을 입력해주세요!");
      return;
    }

    if (isEditMode) {
      message.success("여행 제목이 수정되었습니다.");
      setStep(false); // 모달 닫기만
    } else {
      setStep(3); // 기존 Planner 단계 진행
    }
  };

  return (
    <Modal
      open={open}
      centered
      closable={false}
      footer={null}
      width="60%"
      styles={{
        body: {
          background: "#fff",
          borderRadius: 18,
          padding: 50,
          textAlign: "center",
        },
      }}
    >
      <h2 className="text-[#2F3E46] text-2xl font-bold mb-8">
        {isEditMode ? "✏️ 여행 제목을 수정하세요" : "✏️ 여행 제목을 입력하세요"}
      </h2>

      <Input
        placeholder="예: 가족과 함께하는 오사카 여행"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        size="large"
        style={{
          width: "80%",
          height: 52,
          fontSize: 17,
          borderRadius: 12,
          borderColor: "#DADADA",
        }}
      />

      <div className="mt-10 flex justify-center gap-6">
        {!isEditMode && (
          <Button
            size="large"
            onClick={() => setStep(1)}
            style={{
              background: "#ECECEC",
              color: "#2F3E46",
              borderRadius: 10,
            }}
          >
            이전
          </Button>
        )}

        <Button
          type="primary"
          size="large"
          style={{ background: "#2F3E46", borderRadius: 10 }}
          onClick={handleConfirm}
        >
          {isEditMode ? "확인" : "다음"}
        </Button>
      </div>
    </Modal>
  );
}
