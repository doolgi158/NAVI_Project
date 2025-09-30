package com.NAVI_Project.user.repository;

import com.NAVI_Project.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}
