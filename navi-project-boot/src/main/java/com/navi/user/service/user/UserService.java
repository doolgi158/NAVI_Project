package com.navi.user.service.user;

import com.navi.user.dto.users.UserRequestDTO;
import com.navi.user.dto.users.UserResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    // DB에서 직접 조회
    UserResponseDTO get(Long no);
    UserResponseDTO signup(UserRequestDTO dto);
    String findUserId(String name, String email);

    // 리액트에서 JWT토큰으로 검색
    UserResponseDTO getMyInfo(String token);
    boolean checkPassword(String token, String currentPw);
    void changePassword(String token, String oldPw, String newPw);

    UserResponseDTO updateUserInfo(String username, UserRequestDTO dto);

    void withdrawUser(String username, String reason, String ip);

    void reactivateUser(String username);
}
