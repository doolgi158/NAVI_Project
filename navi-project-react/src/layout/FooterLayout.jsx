import React from "react";
import { Layout, Row, Col, Typography, Space, Image } from "antd";

const { Footer } = Layout;
const { Text } = Typography;

const FooterLayout = () => {
    return (   
        <Footer
            style={{
            background: "#f9f9f9",
            padding: "20px 50px",
            borderTop: "1px solid #eaeaea",
            }}
        >
            <Row justify="space-between" align="middle">
                {/* 좌측: 카피라이트 & 설명 텍스트 */}
                <Col xs={24} md={12}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        © 2025 NAVI. All Rights Reserved.
                    </Text>
                    <br />
                    <Text style={{ fontSize: "12px", color: "#666" }}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                        eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </Text>
                </Col>

                {/* 우측: 로고 영역 */}
                <Col xs={24} md={8} style={{ textAlign: "right" }}>
                    <Space size="middle">
                        <Image
                            src="/images/tourapi.png"
                            alt="TourAPI"
                            preview={false}
                            width={80}
                        />
                        <Image
                            src="/images/kto.png"
                            alt="한국관광공사"
                            preview={false}
                            width={100}
                        />
                    </Space>
                </Col>
            </Row>
        </Footer>
    );
};

export default FooterLayout;