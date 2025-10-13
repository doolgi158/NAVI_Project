package com.navi.user.service.social;

import com.navi.user.dto.SocialDTO;
import com.navi.user.enums.SocialState;

public interface SocialLoginService {
    public SocialDTO socialLogin(SocialState provider, String code);
}