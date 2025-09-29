package com.NAVI_Project.accommodation.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="NAVI_ACCOMMODATION")
public class Acc {
    @Id
    private String acc_id;
    private int contentid_raw;
    private String title;
    private String type;
    private String tel;
    private int township_id;
    private String addr;
    private String mapy;
    private String mapx;
    private String overview;
    private String checkin_time;
    private String checkout_time;
    private String modified_time;
    private boolean cooking;
    private boolean parking;
    private char deletable_yn;
    private char operation_yn;
}
