package com.navi.image.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.repository.AccRepository;
import com.navi.image.domain.Image;
import com.navi.image.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageBatchService {
    private final ImageRepository imageRepository;
    private final AccRepository accRepository;

    private static final String BASE_DIR = new File("uploads/acc/").getAbsolutePath() + File.separator;

    public void insertAccImagesFromFolder() {
        File folder = new File(BASE_DIR);

        if (!folder.exists() || !folder.isDirectory()) {
            log.warn("⚠️ 숙소 이미지 폴더가 존재하지 않습니다: {}", BASE_DIR);
            return;
        }

        File[] files = folder.listFiles((dir, name) -> name.matches(".*\\.(jpg|png|jpeg|webp)$"));
        if (files == null || files.length == 0) {
            log.warn("⚠️ 처리할 이미지 파일이 없습니다.");
            return;
        }

        int success = 0;
        int failed = 0;

        List<Acc> allAcc = accRepository.findAll();

        for (File file : files) {
            try {
                String fileName = file.getName(); // 예: 제주오션뷰호텔_1.jpg
                String accName = extractAccName(fileName); // "제주오션뷰호텔"

                if (accName == null) {
                    log.warn("❌ 숙소명 추출 실패: {}", fileName);
                    failed++;
                    continue;
                }

                String cleanName = accName.replaceAll("\\s+", "").toLowerCase();

                Optional<Acc> accOpt = allAcc.stream()
                        .filter(acc -> acc.getTitle() != null
                                && acc.getTitle().replaceAll("\\s+", "").toLowerCase().contains(cleanName))
                        .findFirst();

                if (accOpt.isEmpty()) {
                    log.warn("❌ 숙소명 매칭 실패: {}", accName);
                    failed++;
                    continue;
                }

                Acc acc = accOpt.get();
                String accId = acc.getAccId();

                // ✅ 파일 확장자 유지
                String ext = fileName.substring(fileName.lastIndexOf("."));
                String uuid = UUID.randomUUID().toString();
                String newFileName = uuid + ext;

                // ✅ 실제 파일명 변경 (rename)
                Path sourcePath = file.toPath();
                Path targetPath = Path.of(BASE_DIR + newFileName);
                Files.move(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);

                // ✅ DB에는 새 경로 저장
                String relativePath = "/uploads/acc/" + newFileName;

                Image image = Image.builder()
                        .targetType("ACC")
                        .targetId(accId)
                        .path(relativePath)
                        .uuidName(uuid)
                        .originalName(fileName) // 원래 이름 보존
                        .build();

                imageRepository.save(image);
                success++;

                log.info("✅ [{}] {} → {} (→ {})", accId, accName, fileName, newFileName);

            } catch (Exception e) {
                failed++;
                log.error("❌ 이미지 처리 오류: {}", file.getName(), e);
            }
        }

        log.info("🎉 숙소 이미지 배치 등록 완료 → 성공: {}건 / 실패: {}건", success, failed);
    }

    /** 파일명에서 숙소명 추출 ("_" 앞부분) */
    private String extractAccName(String fileName) {
        try {
            return fileName.split("_")[0];
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 🔹 아직 UUID로 이름 변경되지 않은 이미지 파일만 처리하는 메서드
     * (이미 uuid로 rename된 파일은 스킵)
     */
    public void insertAccImagesOnlyNonUUID() {
        File folder = new File(BASE_DIR);

        if (!folder.exists() || !folder.isDirectory()) {
            log.warn("⚠️ 숙소 이미지 폴더가 존재하지 않습니다: {}", BASE_DIR);
            return;
        }

        // jpg/png/webp 파일만 필터
        File[] files = folder.listFiles((dir, name) -> name.matches(".*\\.(jpg|png|jpeg|webp|JPG|PNG|JPEG|WEBP)$"));
        if (files == null || files.length == 0) {
            log.warn("⚠️ 처리할 이미지 파일이 없습니다.");
            return;
        }

        int success = 0;
        int skipped = 0;
        int failed = 0;

        List<Acc> allAcc = accRepository.findAll();

        for (File file : files) {
            try {
                String fileName = file.getName();

                // ✅ 1. 이미 UUID로 된 파일은 스킵
                if (fileName.matches("^[0-9a-fA-F\\-]{36}\\..+$")) {
                    skipped++;
                    continue;
                }

                String accName = extractAccName(fileName); // "숙소명"
                if (accName == null) {
                    log.warn("❌ 숙소명 추출 실패: {}", fileName);
                    failed++;
                    continue;
                }

                String cleanName = accName.replaceAll("\\s+", "").toLowerCase();

                Optional<Acc> accOpt = allAcc.stream()
                        .filter(acc -> acc.getTitle() != null
                                && acc.getTitle().replaceAll("\\s+", "").toLowerCase().contains(cleanName))
                        .findFirst();

                if (accOpt.isEmpty()) {
                    log.warn("❌ 숙소명 매칭 실패: {}", accName);
                    failed++;
                    continue;
                }

                Acc acc = accOpt.get();
                String accId = acc.getAccId();

                // ✅ 새 UUID 파일명 생성
                String ext = fileName.substring(fileName.lastIndexOf("."));
                String uuid = UUID.randomUUID().toString();
                String newFileName = uuid + ext;

                Path sourcePath = file.toPath();
                Path targetPath = Path.of(BASE_DIR + newFileName);
                Files.move(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);

                String relativePath = "/uploads/acc/" + newFileName;

                // ✅ DB에 신규 저장
                Image image = Image.builder()
                        .targetType("ACC")
                        .targetId(accId)
                        .path(relativePath)
                        .uuidName(uuid)
                        .originalName(fileName)
                        .build();

                imageRepository.save(image);
                success++;

                log.info("✅ [{}] {} → {} (→ {})", accId, accName, fileName, newFileName);

            } catch (Exception e) {
                failed++;
                log.error("❌ 이미지 처리 오류: {}", file.getName(), e);
            }
        }

        log.info("🎉 UUID 미적용 숙소 이미지 등록 완료 → 성공: {}건 / 스킵: {}건 / 실패: {}건", success, skipped, failed);
    }

}
