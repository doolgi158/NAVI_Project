package com.navi.image.dto;

import com.navi.image.domain.Image;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ImageDTO {
    private Long no;
    private String targetType;
    private String targetId;
    private String path;
    private String originalName;
    private String uuidName;

    public static ImageDTO fromEntity(Image image) {
        return ImageDTO.builder()
                .no(image.getNo())
                .targetType(image.getTargetType())
                .targetId(image.getTargetId())
                .path(image.getPath())
                .originalName(image.getOriginalName())
                .uuidName(image.getUuidName())
                .build();
    }

    public Image toEntity() {
        return Image.builder()
                .no(this.no)
                .targetType(this.targetType)
                .targetId(this.targetId)
                .path(this.path)
                .originalName(this.originalName)
                .uuidName(this.uuidName)
                .build();
    }
}
