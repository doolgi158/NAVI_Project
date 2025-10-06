package com.navi.user.service;

import com.navi.user.dto.TryLoginDTO;

public interface TryLoginService {
    public TryLoginDTO handleLoginFail(String ip);
    public TryLoginDTO handleLoginSuccess(String ip);
}
