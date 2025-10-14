import React, { useRef, useState, useMemo } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

// ✅ 드래그 앤 드롭 기능을 위해 quill-image-drop-module을 설치했다고 가정
// import ImageDrop from "quill-image-drop-module"; 

hljs.configure({ languages: ["javascript", "html", "css", "java", "json"] });

// 🔒 중복 등록 방지
if (typeof Quill !== "undefined" && !Quill.imports["modules/imageResize"]) {
  Quill.register("modules/imageResize", ImageResize);
}

// // ✅ (옵션) 이미지 드롭 모듈 등록
// if (typeof Quill !== "undefined" && !Quill.imports["modules/imageDrop"]) {
//   Quill.register("modules/imageDrop", ImageDrop);
// }

const TravelEditor = ({ value = "", onChange }) => {
  const quillRef = useRef(null);
  const [height, setHeight] = useState(500);
  useEffect(() => {
    hljs.highlightAll(); // ✅ 이제 안전하게 실행됨
  }, []);

  // ✅ 툴바, 하이라이트, 이미지리사이즈 등 모듈 설정
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike", { color: [] }, { background: [] }],
        [{ align: [] }, { list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link", "image", "video"],
        ["clean"],
      ],
      imageResize: { displaySize: true, modules: ["Resize", "DisplaySize"] },
      syntax: { highlight: (t) => hljs.highlightAuto(t).value },
      // // ✅ 이미지 드롭 모듈 추가 (설치 후 주석 해제)
      // imageDrop: true, 
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "align",
    "color",
    "background",
    "list",
    "indent",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  /** ✅ onChange 이벤트 */
  const handleChange = (html) => onChange?.(html);

  /** ✅ 리사이즈 핸들러 */
  const startResize = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = height;
    const onMove = (ev) => {
      const newH = Math.min(Math.max(startH + (ev.clientY - startY), 300), 1200);
      setHeight(newH);
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid #d9d9d9",
        borderRadius: 8,
        background: "#fff",
        overflow: "hidden",
        height: `${height}px`,
        transition: "height 0.1s ease-out",
      }}
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder="여행지 소개를 입력하세요"
        style={{
          flex: 1,
          border: "none",
          overflowY: "auto",
        }}
      />

      {/* ✅ 리사이즈 핸들 */}
      <div
        onMouseDown={startResize}
        style={{
          height: "22px",
          background: "linear-gradient(to bottom, #fafafa, #eaeaea)",
          borderTop: "1px solid #ccc",
          textAlign: "center",
          color: "#999",
          fontSize: "12px",
          cursor: "ns-resize",
          userSelect: "none",
          lineHeight: "22px",
        }}
      >
        ↕ 높이 조절
      </div>

      {/* ✅ 에디터 스타일 */}
      <style>
        {`
          .ql-container {
            /* ✅ 툴바를 제외한 나머지 공간을 차지하도록 flex 설정 */
            flex: 1;
            min-height: 0; 
            border: none !important;
          }
          .ql-editor {
            height: 100%; 
            line-height: 1.8;
            font-size: 15px;
          }
          /* --- 이미지 정렬 (옆으로 붙이기 유사 기능) --- */
          /* 이미지를 클릭하고 정렬 버튼을 눌러 float 속성을 적용할 수 있습니다. */
          
          /* 기본 이미지 스타일 */
          .ql-editor img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin: 10px 0; /* 중앙 정렬 대신 여백 조정 */
            display: inline-block; /* 옆으로 붙이기 위해 block -> inline-block으로 변경 */
          }
          
          /* ✅ 왼쪽 정렬: 이미지 옆으로 텍스트나 다른 인라인 요소가 붙을 수 있음 */
          /* 옆으로 붙이는 효과를 보려면 이미지의 width를 작게 조정해야 합니다. */
          .ql-align-left img { 
            float: left; 
            margin-right: 15px; 
            max-width: 48%; /* 너비를 줄여야 옆 공간이 생깁니다. */
          }
          
          /* ✅ 오른쪽 정렬 */
          .ql-align-right img { 
            float: right; 
            margin-left: 15px; 
            max-width: 48%; /* 너비를 줄여야 옆 공간이 생깁니다. */
          }
          
          /* ✅ 중앙 정렬: float을 해제하고 다시 중앙에 배치 */
          .ql-align-center img { 
            display: block; 
            margin: 10px auto; 
            float: none; 
          }
          
          /* float된 요소 다음 줄바꿈을 위해 */
          .ql-editor::after {
            content: "";
            display: table;
            clear: both;
          }
          
          /* --- 기존 스타일 유지 --- */
          pre.ql-syntax {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 12px;
            border-radius: 6px;
            font-family: "Fira Code", monospace;
          }
          blockquote {
            border-left: 4px solid #ccc;
            margin: 10px 0;
            padding-left: 10px;
            color: #555;
            font-style: italic;
          }
        `}
      </style>
    </div>
  );
};

export default TravelEditor;