package com.navi.image.service;

import com.navi.image.domain.Image;
import com.navi.image.repository.ImageRepository;
import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ImageServiceImpl implements ImageService{
    private final ImageRepository imageRepository;
    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "C:/navi/uploads/";

    public Image uploadUserProfile(MultipartFile file, Long userNo) throws IOException {
        // 사용자 조회
        User user = userRepository.findByNo(userNo)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 업로드 폴더 생성
        Files.createDirectories(Paths.get(UPLOAD_DIR + "profile/"));


        // 파일명 구성
        String originalName = file.getOriginalFilename();
        String ext = originalName.substring(originalName.lastIndexOf("."));
        String fileName = UUID.randomUUID() + ext;
        String savePath = UPLOAD_DIR + "profile/" + fileName;

        // 기존 이미지가 있다면 삭제
        imageRepository.findByUser_No(userNo).ifPresent(old -> {
            try {
                Files.deleteIfExists(Paths.get(UPLOAD_DIR).resolve(old.getPath().replace("/uploads/", "")));
            } catch (IOException ignored) {}
            imageRepository.deleteByUser_No(userNo);
        });

        // 새 파일 저장
        Files.write(Paths.get(savePath), file.getBytes());

        // 새 Image 엔티티 저장
        Image image = Image.builder()
                .targetId("USER_PROFILE")
                .path("/uploads/profile/" + fileName)
                .user(user)
                .build();

        return imageRepository.save(image);
    }
}
