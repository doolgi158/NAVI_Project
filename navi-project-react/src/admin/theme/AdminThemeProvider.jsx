import React from "react";
import { ConfigProvider } from "antd";

/**
 * ✅ NAVI 관리자 전용 전역 테마 Provider
 *  - 전체 관리자 페이지의 색상, 라운드, 폰트, 버튼/입력/테이블 톤 통일
 */
const NAVI_BLUE = "#0A3D91";

export default function AdminThemeProvider({ children }) {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: NAVI_BLUE,
                    colorInfo: NAVI_BLUE,
                    borderRadius: 12,
                    colorBgLayout: "#F7F8FB",
                    colorText: "#1F2937",
                    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: 14,
                    controlHeight: 30,
                },
                components: {
                    Button: {
                        borderRadius: 10,
                        fontWeight: 500,
                        colorBgContainerDisabled: "#E5E7EB",
                    },
                    Input: {
                        borderRadius: 10,
                        colorBgContainer: "#FFFFFF",
                        colorBorder: "#CBD5E1",
                        colorBgContainerDisabled: "#F3F4F6",
                    },
                    Select: {
                        borderRadius: 10,
                        colorBgContainer: "#FFFFFF",
                    },
                    Table: {
                        borderRadius: 12,
                        headerBg: "#F2F5FA",
                        headerColor: "#1F2937",
                        rowHoverBg: "#F7FAFF",
                        colorBgContainer: "#FFFFFF",
                        cellPaddingBlock: 12,
                        cellPaddingInline: 12,
                    },
                    Card: {
                        borderRadiusLG: 14,
                        colorBgContainer: "#FFFFFF",
                        headerBg: "#FFFFFF",
                    },
                    Tag: {
                        borderRadiusSM: 8,
                        fontWeight: 500,
                    },
                },
            }}
        >
            {children}
        </ConfigProvider>
    );
}
