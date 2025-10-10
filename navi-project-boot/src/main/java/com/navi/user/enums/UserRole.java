package com.navi.user.enums;

public enum UserRole {
    ADMIN, USER;

    public String getAuthority() {
        return this.name();
    }
}
