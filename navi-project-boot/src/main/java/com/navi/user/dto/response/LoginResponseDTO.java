package com.navi.user.dto.response;

import lombok.Builder;

@Builder
public class LoginResponseDTO {
    private String accessToken;
    private String refreshToken;
    private UserResponseDTO user;
}
