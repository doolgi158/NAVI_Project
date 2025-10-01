package com.navi.user.trylogin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "navi_try")
public class TryLoginDTO {
    @Column(name = "try_count", nullable = false)
    @ColumnDefault(value = "0")
    private int count;      // 시도 횟수

    @Column(name = "try_state", nullable = false)
    @ColumnDefault(value = "T")
    private char state;     // 성공 여부

    @Column(name = "try_time")
    @ColumnDefault(value = "Sysdate")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private String time;    // 로그인 시간
}
