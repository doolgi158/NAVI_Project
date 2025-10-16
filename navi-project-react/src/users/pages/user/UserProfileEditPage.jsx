import React, { useEffect, useRef, useState } from "react";
import { Button, Card, message } from "antd";
import axios from "axios";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import MainLayout from "@/users/layout/MainLayout";
import { useLocation, useNavigate } from "react-router-dom";

const UserProfileEditPage = () => {
  const location = useLocation();
  const initialProfile = location.state?.profileUrl || null;
  const navigator = useNavigate();

  const [imageSrc, setImageSrc] = useState(initialProfile);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);

  // 파일 선택 시 새 이미지 로드
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  // 드래그 시작
  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    setDragging(true);
  
    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setOffset({
        x: startX - position.x,
        y: startY - position.y,
    });
  };

  // 드래그 이동
  const handleMouseMove = (e) => {
    if (!dragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setPosition({
        x: currentX - offset.x,
        y: currentY - offset.y,
    });
  };

  // 드래그 종료
  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  });

  // 업로드 처리
  const handleUpload = async () => {
    if (!imageSrc) return message.warning("이미지를 먼저 선택해주세요.");

    setLoading(true);

    // 원형 300x300 크롭
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    const img = new Image();
    img.crossOrigin = "anonymous"
    img.src = imageSrc;

    img.onload = async () => {
        // 흰색 배경 (투명 원치 않을 때)
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, size, size);

        // 원형 마스크
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // 현재 위치 기반으로 이미지 그리기
        const drawX = size / 2 - img.width / 2 + position.x;
        const drawY = size / 2 - img.height / 2 + position.y;
        
        ctx.drawImage(img, drawX, drawY, img.width, img.height);
        ctx.restore();

        // Blob으로 변환
        canvas.toBlob(
          async (blob) => {
            const croppedFile = new File([blob], "profile.jpg", { type: "image/jpeg" });
            const formData = new FormData();
            formData.append("file", croppedFile);
            formData.append("targetType", "USER");
            formData.append("targetId", localStorage.getItem("username"));

            try {
                const res = await axios.post(`${API_SERVER_HOST}/api/images/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                });

                const newPath = res.data.data.path;
                window.dispatchEvent(
                    new CustomEvent("profile-updated", { detail: { newProfile: newPath } })
                );
                message.success("프로필 이미지가 변경되었습니다!");
                navigator("/users/detail");
            } catch (err) {
                message.error("업로드 중 오류 발생");
            } finally {
                setLoading(false);
            }
          },
            "image/jpeg",
            0.9
        );
      };
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF9F7]">
        <Card
          title="프로필 이미지 편집"
          className="rounded-2xl shadow-md border border-gray-100 w-full max-w-2xl"
          bodyStyle={{ padding: "2rem" }}
        >
          {!imageSrc ? (
            <div className="flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="mb-4"
              />
              <p className="text-gray-500 text-sm text-center">
                이미지는 원형 형태로 표시되며, <br />
                300×300 크기로 자동 조정됩니다.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
            
            {/* 미리보기 영역 */}
            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                className="relative w-[600px] h-[600px] border-2 border-gray-300 overflow-hidden shadow-md mb-6 bg-black/10 cursor-move flex items-center justify-center"
            >
            {/* 이미지 */}
            <img
                src={imageSrc}
                alt="preview"
                draggable={false}
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                    width: "auto",
                    height: "auto",
                    maxWidth: "none",
                    maxHeight: "none",
                    userSelect: "none",
                    pointerEvents: "none",
                }}
            />

            {/* 어두운 블러 오버레이 */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <mask id="circleMask">
                        {/* 전체 영역 하얗게 → 전체 가려짐 */}
                        <rect width="100%" height="100%" fill="white" />
                        {/* 가운데 원형 부분만 투명하게 뚫기 */}
                        <circle cx="50%" cy="50%" r="150" fill="black" />
                    </mask>
                </defs>
                {/* 마스크 적용 + 블러 필터 */}
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.5)"
                    style={{ backdropFilter: "blur(6px)" }}
                    mask="url(#circleMask)"
                />
                {/* 원형 가이드 라인 */}
                <circle
                    cx="50%"
                    cy="50%"
                    r="150"
                    stroke="#a5b4fc"
                    strokeWidth="3"
                    fill="none"
                />
            </svg>
        </div> 
              {/* 버튼 영역 */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    id="fileUpload"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    onClick={() => document.getElementById("fileUpload").click()}
                    className="border-gray-300 hover:border-indigo-400 hover:text-indigo-500 transition"
                  >
                    파일 선택
                  </Button>

                  <Button
                    type="primary"
                    loading={loading}
                    className="bg-indigo-500 hover:bg-indigo-600"
                    onClick={handleUpload}
                  >
                    적용하기
                  </Button>
                </div>

                <p className="text-gray-500 text-sm text-center mt-2">
                  마우스로 이미지를 드래그하여 위치를 조정할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserProfileEditPage;