package com.navi.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;

import java.time.LocalDateTime;

//좋아요/북마크/조회수용 업데이트방지
@Getter
@MappedSuperclass
public abstract class BaseEntityNoAudit {

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

