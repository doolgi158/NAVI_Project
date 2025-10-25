package com.navi.security;

import com.navi.user.domain.User;
import com.navi.user.dto.auth.UserSecurityDTO;
import com.navi.user.enums.UserState;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityUserDetailsService implements UserDetailsService {
    public final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.getUser(username);
        if (user == null) {
            throw new UsernameNotFoundException(username + "번의 유저를 찾을 수 없습니다.");
        } else if (user.getUserState() == UserState.SLEEP) {
            throw new LockedException("휴면 계정입니다.");
        }
        
        return new UserSecurityDTO(user);
    }
}
