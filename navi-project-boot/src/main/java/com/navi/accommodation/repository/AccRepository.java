package com.navi.accommodation.repository;

import com.navi.accommodation.domain.Acc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AccRepository extends JpaRepository<Acc, String> {
//    @Query("SELECT COALESCE(MAX(a.accId), 'ACC00000') FROM Acc a")
//    String findMaxAccId();

    @Query(value = "SELECT NAVI_ACC_SEQ.NEXTVAL FROM dual", nativeQuery = true)
    Long getNextAccSeq();
}
