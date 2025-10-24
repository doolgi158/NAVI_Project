import React, { useState, useEffect } from "react";
import { Modal, DatePicker, Button, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/ko";

/**
 * NAVI 스타일 날짜 선택 모달
 * @param {Object} props
 * @param {boolean} open - 모달 열림 상태
 * @param {function} onClose - 닫기 콜백
 * @param {Object} meta - 일정 메타정보 ({ startDate, endDate })
 * @param {boolean} isEditMode - 수정 모드 여부
 * @param {function} onDateChange - 날짜 변경 시 콜백
 */
export default function DateModal({
  open,
  onClose,
  meta = {}, // ✅ undefined 방지
  isEditMode = false,
  onDateChange,
}) {
  // ✅ meta가 비어있어도 절대 오류 안남
  const start = meta?.startDate ? dayjs(meta.startDate) : null;
  const end = meta?.endDate ? dayjs(meta.endDate) : null;

  const [range, setRange] = useState([start, end]);

  useEffect(() => {
    if (meta?.startDate && meta?.endDate) {
      setRange([dayjs(meta.startDate), dayjs(meta.endDate)]);
    }
  }, [meta]);

  /** ✅ 과거 날짜 비활성화 */
  const disabledDate = (current) => current && current < dayjs().startOf("day");

  /** ✅ 날짜 선택 후 확인 */
  const handleConfirm = () => {
    if (!range?.[0] || !range?.[1]) {
      return message.warning("여행 날짜를 모두 선택해주세요.");
    }

    if (onDateChange) {
      onDateChange(range[0], range[1]);
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
          padding: 40,
          textAlign: "center",
        },
      }}
    >
      {/* ✅ 헤더 영역 */}
      <div className="mb-8">
        <h2 className="text-[#2F3E46] text-2xl font-bold mb-2">
          📅 여행 날짜를 {isEditMode ? "수정" : "선택"}하세요
        </h2>
        {isEditMode && (
          <p className="text-gray-500 text-sm">
            현재 일정:{" "}
            <b>
              {meta.startDate || "-"} ~ {meta.endDate || "-"}
            </b>
          </p>
        )}
      </div>

      {/* ✅ 날짜 선택기 */}
      <DatePicker.RangePicker
        locale={dayjs.locale("ko")}
        value={range}
        onChange={setRange}
        disabledDate={disabledDate}
        style={{
          width: "80%",
          height: 52,
          fontSize: 17,
          borderRadius: 10,
          border: "1px solid #dcdcdc",
        }}
        popupClassName="navi-date-picker-popup"
      />

      {/* ✅ 하단 버튼 영역 */}
      <div className="mt-10 flex justify-center gap-6">
        <Button
          size="large"
          style={{
            background: "#ECECEC",
            color: "#2F3E46",
            borderRadius: 10,
            fontWeight: 500,
          }}
          onClick={onClose} // ✅ 단순 닫기
        >
          취소
        </Button>
        <Button
          type="primary"
          size="large"
          style={{
            background: "#2F3E46",
            borderRadius: 10,
            fontWeight: 500,
          }}
          onClick={handleConfirm}
        >
          {isEditMode ? "변경하기" : "선택 완료"}
        </Button>
      </div>

      {/* ✅ 안내 문구 */}
      <div className="mt-8 text-gray-400 text-sm">
        {isEditMode ? (
          <>
            ⚠️ 날짜를 변경하면 기존 숙소 정보가 초기화됩니다.
            <br />
            공항 일정은 자동으로 유지됩니다.
          </>
        ) : (
          <>여행 시작일과 종료일을 선택하세요.</>
        )}
      </div>
    </Modal>
  );
}
