import axios from "axios";

// 서버 주소
export const host = "http://localhost:8080";

// 기본 매팅
const prefix = `${host}/api/user`;

export const Userlogin = async(loginParam) => {
    const header = {headers: {"Content-Type": "x-www-form-urlencoded"}};
    
    const form = new FormData();
    form.append("userId", loginParam.userId);
    form.append("userPw", loginParam.userPw);
    
    const response = await axios.post(`${prefix}/login`, form, header);

    return response.data;
};