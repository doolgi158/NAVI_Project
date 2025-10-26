// components/plan/scheduler/TimeEditModal.jsx
import React, { useRef } from "react";
import { Modal, TimePicker } from "antd";

/**
 * TimeEditModal
 * - 일정별 시간 설정 모달
 * - 기존 PlanScheduler 하단 Modal 부분 그대로 이전
 */
export default function TimeEditModal({
    open = false,
    tempStart,
    tempEnd,
    setTempStart,
    setTempEnd,
    onCancel,
    onSave,
    openKey,
    setOpenKey,
    selectedPart,
    setSelectedPart,
    getDisabledStartTime,
    getDisabledEndTime,
}) {
    const endPickerRef = useRef(null);

    return (
        <Modal
            title="일정 시간 설정"
            open={open}
            onCancel={onCancel}
            onOk={onSave}
            okText="저장"
            cancelText="취소"
            centered
        >
            <div className="flex items-center gap-3 justify-center py-2">
                {/* 시작시간 */}
                <TimePicker
                    format="HH:mm"
                    minuteStep={5}
                    showNow={false}
                    needConfirm={false}
                    value={tempStart}
                    open={openKey === "start"}
                    onOpenChange={(open) => {
                        if (open) {
                            setSelectedPart(null);
                            setOpenKey("start");
                        } else {
                            setOpenKey(null);
                        }
                    }}
                    onSelect={(v) => {
                        if (selectedPart === null) {
                            // 첫 번째 선택(시)
                            setSelectedPart("hour");
                            setTempStart(v);
                        } else if (selectedPart === "hour") {
                            // 두 번째 선택(분)
                            setTempStart(v);
                            setSelectedPart(null);
                            setOpenKey(null);
                            // ✅ 종료시간으로 자동 포커스
                            setTimeout(() => {
                                if (endPickerRef.current) endPickerRef.current.focus();
                            }, 150);
                        }
                    }}
                    onChange={(v) => setTempStart(v)}
                    placeholder="시작"
                    disabledTime={() => getDisabledStartTime(tempEnd)}
                />

                <span>~</span>

                {/* 종료시간 */}
                <TimePicker
                    ref={endPickerRef}
                    format="HH:mm"
                    minuteStep={5}
                    showNow={false}
                    needConfirm={false}
                    value={tempEnd}
                    open={openKey === "end"}
                    onOpenChange={(open) => {
                        if (open) {
                            setSelectedPart(null);
                            setOpenKey("end");
                        } else {
                            setOpenKey(null);
                        }
                    }}
                    onSelect={(v) => {
                        if (selectedPart === null) {
                            setSelectedPart("hour");
                            setTempEnd(v);
                        } else if (selectedPart === "hour") {
                            setTempEnd(v);
                            setSelectedPart(null);
                            setOpenKey(null);
                        }
                    }}
                    onChange={(v) => setTempEnd(v)}
                    placeholder="종료"
                    disabledTime={() => getDisabledEndTime(tempStart)}
                />
            </div>

            <div className="text-xs text-gray-500 text-center mt-2">
                둘 다 비우면 시간 미지정으로 처리되어 정렬 대상에서 제외됩니다.
            </div>
        </Modal>
    );
}
