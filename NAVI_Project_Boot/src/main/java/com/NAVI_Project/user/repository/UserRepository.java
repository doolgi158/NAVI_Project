package com.NAVI_Project.user.repository;

import com.NAVI_Project.user.domain.User;
import org.springframework.data.repository.CrudRepository;

public interface UserRepository extends CrudRepository<User, Long> {

}
