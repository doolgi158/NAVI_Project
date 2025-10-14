package com.navi.image.service;

import com.navi.image.domain.Image;
import com.navi.image.dto.ImageDTO;
import com.navi.image.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ImageServiceImpl implements ImageService{
    private final ImageRepository imageRepository;

    private static final String BASE_DIR = "C:/navi-project/images/";

    @Override
    public ImageDTO uploadImage(MultipartFile file, String targetType, String targetId) {
        try {
            // targetType별 소문자 폴더 지정
            String folderName = getFolderName(targetType); // 아래 별도 메서드 참고
            Path uploadPath = Paths.get(BASE_DIR + folderName + "/");

            // 폴더 생성 (없으면 자동 생성)
            Files.createDirectories(uploadPath);

            // 파일명 구성
            String originalName = file.getOriginalFilename();
            String ext = originalName.substring(originalName.lastIndexOf("."));
            String uuidName = UUID.randomUUID() + ext;
            String savePath = uploadPath.resolve(uuidName).toString();

            // 기존 이미지 확인 (targetType + targetId 기준)
            Image existing = imageRepository
                    .findByTargetTypeAndTargetId(targetType, targetId)
                    .orElse(null);

            // 기존 파일이 있으면 삭제
            if (existing != null) {
                try {
                    Files.deleteIfExists(Paths.get(BASE_DIR)
                            .resolve(existing.getPath().replace("/images/", "")));
                } catch (IOException ignored) {}

                existing.updatePath(
                        "/images/" + targetType.toLowerCase() + "/" + uuidName,
                        uuidName,
                        originalName
                );
                Files.write(Paths.get(savePath), file.getBytes());
                return ImageDTO.fromEntity(existing);
            }

            // 신규 파일 저장
            Files.write(Paths.get(savePath), file.getBytes());

            // 엔티티 생성 및 저장
            Image newImage = Image.builder()
                    .targetType(targetType)
                    .targetId(targetId)
                    .path("/images/" + folderName  + "/" + uuidName)
                    .uuidName(uuidName)
                    .originalName(originalName)
                    .build();

            Image saved = imageRepository.save(newImage);
            return ImageDTO.fromEntity(saved);

        } catch (IOException e) {
            throw new IllegalStateException("이미지 업로드 실패: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ImageDTO> getImagesByTarget(String targetType, String targetId) {
        return imageRepository.findAllByTargetTypeAndTargetId(targetType, targetId)
                .stream()
                .map(ImageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteImage(String targetType, String targetId) {
        imageRepository.findByTargetTypeAndTargetId(targetType, targetId)
                .ifPresent(image -> {
                    try {
                        Files.deleteIfExists(Paths.get(BASE_DIR)
                                .resolve(image.getPath().replace("/images/", "")));
                    } catch (IOException ignored) {}
                    imageRepository.delete(image);
                });
    }

    // targetType별 실제 폴더 이름을 반환하는 메서드
    private String getFolderName(String targetType) {
        switch (targetType.toUpperCase()) {
            case "USER":
                return "profile";
            case "ROOM":
                return "room";
            case "ACC":
                return "acc";
            case "TRAVEL":
                return "travel";
            case "POST":
                return "post";
            default:
                return "etc";
        }
    }
}
