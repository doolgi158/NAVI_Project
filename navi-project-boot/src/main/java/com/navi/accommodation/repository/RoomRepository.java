package com.navi.accommodation.repository;

import com.navi.accommodation.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
}
