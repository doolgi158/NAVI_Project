package com.navi.user.dto.auth;

import com.navi.user.domain.User;
import com.navi.user.enums.UserState;
import lombok.Getter;
import lombok.ToString;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Map;

@ToString
@Getter
public class UserSecurityDTO extends org.springframework.security.core.userdetails.User {
    private final Long no;
    private final String id;
    private final String name;
    private final String email;
    private final UserState userState;
    private final List<String> roles;

    public UserSecurityDTO(User user) {
        super(user.getId(), user.getPw(),
                user.getUserRoleList().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                        .toList());
        this.no = user.getNo();
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.userState = user.getUserState();
        this.roles = user.getUserRoleList().stream().map(Enum::name).toList();
    }

    public UserSecurityDTO(String id, String password, List<SimpleGrantedAuthority> authorities, Long no, String name,
                           String email, UserState userState, List<String> roles) {
        super(id, password, authorities);
        this.no = no;
        this.id = id;
        this.name = name;
        this.email = email;
        this.userState = userState;
        this.roles = roles;
    }

    public Map<String, Object> getClaims() {
        return Map.of(
                "no", no,
                "id", id,
                "email", email,
                "roles", roles,
                "state", userState
        );
    }
}
