import React, { useState, useEffect } from "react";
import { getAccessToken, parseJwt } from "../api/naviApi";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

export const useAuth = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = getAccessToken();
        if (!token) {
            message.warning("로그인 후 이용 가능한 서비스입니다.");
            navigate("/login");
            return;
        }

        const payload = parseJwt(token);
        if (!payload?.id) {
            message.error("로그인 정보가 유효하지 않습니다.");
            navigate("/login");
            return;
        }

        setUser(payload);
    }, [navigate]);

    return user;
};
