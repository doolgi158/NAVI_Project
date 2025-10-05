package com.navi.accommodation.repository;

import com.navi.accommodation.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findAllByContentId(Long contentId);
}
