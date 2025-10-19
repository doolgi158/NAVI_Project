package com.navi.user.repository;

import com.navi.accommodation.domain.Acc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardAccRepository extends JpaRepository<Acc, Long> {

}
