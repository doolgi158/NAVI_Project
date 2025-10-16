package com.navi.image.domain;

import com.navi.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "NAVI_IMAGE")
@SequenceGenerator(
        name = "image_generator",
        sequenceName = "IMAGE_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class Image extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "image_generator")
    private Long no; // 이미지 고유 번호

    /** 어떤 테이블의 이미지를 참조하는지 구분 */
    @Column(name = "target_type", length = 30, nullable = false)
    private String targetType; // 예: USER, ACC, ROOM, TRAVEL, POST

    /** 참조 대상의 고유 식별자 (user_id, room_id, acc_id 등) */
    @Column(name = "target_id", length = 50, nullable = false)
    private String targetId;

    /** 실제 저장된 경로 (ex: /uploads/profile/uuid.png) */
    @Column(name = "path", length = 255, nullable = false)
    private String path;

    /** 원본 파일명 */
    @Column(name = "original_name", length = 255)
    private String originalName;

    /** 저장된 파일명(UUID) */
    @Column(name = "uuid_name", length = 255)
    private String uuidName;

    /** 이미지 정보 수정 메서드 */
    public void updatePath(String newPath, String newUuid, String newOriginal) {
        this.path = newPath;
        this.uuidName = newUuid;
        this.originalName = newOriginal;
    }
}
