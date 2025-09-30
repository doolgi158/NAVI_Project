package com.navi.user.repository;

import com.navi.user.userdomain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}
