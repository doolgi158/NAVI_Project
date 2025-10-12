package com.navi.image.domain;

import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name="NAVI_IMAGE")
@SequenceGenerator(
        name = "image_generator",
        sequenceName = "IMAGE_SEQ",
        initialValue = 1,
        allocationSize = 1)
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "acc_generator")
    //private Long imageId;
    private Long no;

    @Column(name = "target_id", length = 20, nullable = false)
    private String targetId;    // ACC, ROM, ...

    @Column(name = "path", length = 255, nullable = false)
    //private String path;
    private String profileUrl;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    private User user;
}
