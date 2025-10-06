package com.navi.user.service;

import com.navi.user.domain.TryLogin;
import com.navi.user.domain.User;
import com.navi.user.dto.TryLoginDTO;

public interface TryLoginService {
    public TryLoginDTO handleLoginFail(User user, String ip);
    public TryLoginDTO handleLoginSuccess(User user, String ip);
    public TryLogin getRecentLoginAttempt(User user);
}
