package com.navi.user.enums;

public enum UserRole {
    ADMIN, USER, GUEST;

    public String getAuthority() {
        return this.name();
    }
}
