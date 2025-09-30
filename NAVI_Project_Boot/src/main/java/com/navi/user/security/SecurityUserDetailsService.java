package com.navi.user.security;

import com.navi.common.response.ApiResponse;
import com.navi.user.domain.User;
import com.navi.user.dto.UserDTO;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
        if(user == null) {
            throw new UsernameNotFoundException(username + "번의 유저를 찾을 수 없습니다.");
        }

        UserDTO userDTO = new UserDTO();
        userDTO.setID(user.getID());
        userDTO.setPW(user.getPW());
        userDTO.setBirth(user.getBirth());
        userDTO.setUserState(user.getUserState());
        userDTO.setEmail(user.getEmail());
        userDTO.setName(user.getName());
        userDTO.setPerNum(user.getPerNum());
        userDTO.setPhone(user.getPhone());

        return userDTO;
    }
}
