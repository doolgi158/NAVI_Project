package com.NAVI_Project.accommodation.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name="NAVI_ROOM")
public class Room {
    private String room_id;
    private String acc_id;
    private String room_nm;
    private int size;
    private int quantity;
    private int base_count;
    private int max_count;
    private int weekday_fee;
    private int weekend_fee;
    private char operation_yn;
}
