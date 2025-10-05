import axios from "axios";

// 서버 주소
export const host = "http://localhost:8080";

// 기본 매팅
const prefix = `${host}/api/users`;

export const Userlogin = async(loginParam) => {
    const params = new URLSearchParams;
    params.append("username", loginParam.userId);
    params.append("password", loginParam.userPw);
    
    const response = await axios.post(`${prefix}/login`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data;
};