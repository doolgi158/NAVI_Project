import React, { useRef, useState, useMemo, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import "quill/dist/quill.snow.css";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import ImageResize from "quill-image-resize-module-react";

hljs.configure({ languages: ["javascript", "html", "css", "java", "json"] });

// ✅ 중복 등록 방지
if (typeof Quill !== "undefined" && !Quill.imports["modules/imageResize"]) {
  Quill.register("modules/imageResize", ImageResize);
}

/* ✅ 1. 이미지 정렬 커스텀 blot */
const BlockEmbed = Quill.import("blots/block/embed");

class CustomImage extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.setAttribute("src", value.url);
    node.setAttribute("alt", value.alt || "");
    node.style.maxWidth = "100%";
    node.style.height = "auto";
    node.style.display = "block";
    node.style.margin =
      value.align === "center"
        ? "0 auto"
        : value.align === "right"
          ? "0 0 0 auto"
          : "0";
    return node;
  }

  static value(node) {
    return {
      url: node.getAttribute("src"),
      alt: node.getAttribute("alt"),
      align:
        node.style.margin === "0 auto"
          ? "center"
          : node.style.margin === "0 0 0 auto"
            ? "right"
            : "left",
    };
  }
}
CustomImage.blotName = "customImage";
CustomImage.tagName = "img";
Quill.register(CustomImage);

/* ✅ 2. 이미지 갤러리 삽입용 커스텀 버튼 */
function insertImageRow(quill) {
  const urls = prompt("쉼표(,)로 구분된 여러 이미지 URL을 입력하세요:");
  if (!urls) return;
  const list = urls
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  if (list.length === 0) return;

  const wrapper = document.createElement("div");
  wrapper.className = "image-row";
  wrapper.style.display = "flex";
  wrapper.style.flexWrap = "wrap";
  wrapper.style.gap = "8px";
  wrapper.style.justifyContent = "center";
  list.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    img.style.width = "180px";
    img.style.height = "auto";
    img.style.borderRadius = "6px";
    img.style.objectFit = "cover";
    img.style.border = "1px solid #ddd";
    wrapper.appendChild(img);
  });

  const range = quill.getSelection(true);
  quill.clipboard.dangerouslyPasteHTML(range.index, wrapper.outerHTML);
}

export default function TravelEditor({ value = "", onChange }) {
  const quillRef = useRef(null);
  const [height, setHeight] = useState(500);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike", { color: [] }, { background: [] }],
          [{ align: [] }, { list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "image", "video"],
          ["insertRowImages"], // ✅ 추가 버튼
          ["clean"],
        ],
        handlers: {
          insertRowImages: function () {
            const quill = quillRef.current.getEditor();
            insertImageRow(quill);
          },
        },
      },
      imageResize: { displaySize: true, modules: ["Resize", "DisplaySize"] },
      syntax: { highlight: (t) => hljs.highlightAuto(t).value },
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
    "customImage",
  ];

  const handleChange = (html) => onChange?.(html);

  const startResize = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = height;
    const onMove = (ev) =>
      setHeight(Math.min(Math.max(startH + (ev.clientY - startY), 300), 1200));
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  /* ✅ 기존 게시글 이미지 자동 가로정렬 */
  useEffect(() => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;

    // ✅ 딱 한 번만 실행하도록 flag 사용
    if (quill.__imageGrouped) return;
    quill.__imageGrouped = true;

    setTimeout(() => {
      const editor = quill.root;
      const imgs = editor.querySelectorAll("p > img");
      if (imgs.length <= 1) return;

      let group = [];
      const newHTML = [];

      imgs.forEach((img, idx) => {
        const parent = img.parentElement;
        group.push(img.outerHTML);

        const next = parent.nextElementSibling;
        const isEnd = !next || !next.querySelector("img");

        if (isEnd) {
          if (group.length > 1) {
            // ✅ 묶어서 이미지 행으로 변환
            const wrapperHTML = `
            <div class="image-row" style="
              display:flex;
              flex-wrap:wrap;
              gap:8px;
              justify-content:center;">
              ${group
                .map(
                  (html) =>
                    html.replace(
                      "<img",
                      `<img style='width:180px;border-radius:6px;border:1px solid #ddd;object-fit:cover;'`
                    )
                )
                .join("")}
            </div>`;
            newHTML.push(wrapperHTML);
          } else {
            newHTML.push(group[0]);
          }
          group = [];
        }
      });

      // ✅ 기존 내용 전체를 교체 (단 한 번)
      if (newHTML.length > 0) {
        quill.root.innerHTML = newHTML.join("<p><br/></p>");
      }
    }, 300);
  }, []); // ✅ 의존성 제거: 처음 렌더 시 1회만 실행


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid #d9d9d9",
        borderRadius: 8,
        background: "#fff",
        overflow: "visible",
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
        placeholder="여행지 소개를 입력하세요 (이미지 정렬 및 갤러리 지원)"
        style={{
          flex: 1,
          border: "none",
          overflowY: "auto",
        }}
      />
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
    </div>
  );
}
