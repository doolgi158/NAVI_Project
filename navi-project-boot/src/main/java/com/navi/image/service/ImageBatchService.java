package com.navi.image.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.repository.AccRepository;
import com.navi.image.domain.Image;
import com.navi.image.repository.ImageRepository;
import com.navi.room.domain.Room;
import com.navi.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageBatchService {
    private final RoomRepository roomRepository;
    private final ImageRepository imageRepository;
    private final AccRepository accRepository;

    private static final String BASE_DIR = "../images/acc/";
    private static final String UPDATE_DIR = "../images/random/";
    private static final String THUMB_DIR = "../images/thumb";  // 썸네일 폴더
    private final Random random = new Random();

    /* ===============================================================
       [1] 숙소 이미지 등록
       =============================================================== */
    public void insertAccImagesFromFolder() {
        File folder = new File(BASE_DIR);

        if (!folder.exists() || !folder.isDirectory()) {
            log.warn("⚠️ 숙소 이미지 폴더가 존재하지 않습니다: {}", BASE_DIR);
            return;
        }

        File[] files = folder.listFiles((dir, name) ->
                name.matches(".*\\.(jpg|jpeg|png|webp|JPG|JPEG|PNG|WEBP)$"));
        if (files == null || files.length == 0) {
            log.warn("⚠️ 처리할 이미지 파일이 없습니다.");
            return;
        }

        int success = 0;
        int failed = 0;
        List<Acc> allAcc = accRepository.findAll();

        for (File file : files) {
            try {
                String fileName = file.getName();
                String accName = extractAccName(fileName);

                if (accName == null) {
                    log.warn("❌ 숙소명 추출 실패: {}", fileName);
                    failed++;
                    continue;
                }

                String cleanName = accName.replaceAll("\\s+", "").toLowerCase();
                Optional<Acc> accOpt = allAcc.stream()
                        .filter(acc -> acc.getTitle() != null &&
                                acc.getTitle().replaceAll("\\s+", "").toLowerCase().contains(cleanName))
                        .findFirst();

                if (accOpt.isEmpty()) {
                    log.warn("❌ 숙소명 매칭 실패: {}", accName);
                    failed++;
                    continue;
                }

                Acc acc = accOpt.get();
                String accId = acc.getAccId();
                String ext = fileName.substring(fileName.lastIndexOf("."));
                String uuid = UUID.randomUUID().toString();
                String newFileName = uuid + ext;

                Path sourcePath = file.toPath();
                Path targetPath = Path.of(BASE_DIR + newFileName);
                Files.move(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);

                String relativePath = "/images/acc/" + newFileName;

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

        log.info("🎉 숙소 이미지 배치 등록 완료 → 성공: {}건 / 실패: {}건", success, failed);
    }

    private String extractAccName(String fileName) {
        try {
            return fileName.split("_")[0];
        } catch (Exception e) {
            return null;
        }
    }

    /* ===============================================================
       [2] UUID 미적용 이미지만 등록
       =============================================================== */
    public void insertAccImagesOnlyNonUUID() {
        File folder = new File(BASE_DIR);

        if (!folder.exists() || !folder.isDirectory()) {
            log.warn("⚠️ 숙소 이미지 폴더가 존재하지 않습니다: {}", BASE_DIR);
            return;
        }

        File[] files = folder.listFiles((dir, name) ->
                name.matches(".*\\.(jpg|jpeg|png|webp|JPG|JPEG|PNG|WEBP)$"));
        if (files == null || files.length == 0) {
            log.warn("⚠️ 처리할 이미지 파일이 없습니다.");
            return;
        }

        int success = 0, skipped = 0, failed = 0;
        List<Acc> allAcc = accRepository.findAll();

        for (File file : files) {
            try {
                String fileName = file.getName();

                if (fileName.matches("^[0-9a-fA-F\\-]{36}\\..+$")) {
                    skipped++;
                    continue;
                }

                String accName = extractAccName(fileName);
                String cleanName = accName.replaceAll("\\s+", "").toLowerCase();

                Optional<Acc> accOpt = allAcc.stream()
                        .filter(acc -> acc.getTitle() != null &&
                                acc.getTitle().replaceAll("\\s+", "").toLowerCase().contains(cleanName))
                        .findFirst();

                if (accOpt.isEmpty()) {
                    log.warn("❌ 숙소명 매칭 실패: {}", accName);
                    failed++;
                    continue;
                }

                Acc acc = accOpt.get();
                String accId = acc.getAccId();

                String ext = fileName.substring(fileName.lastIndexOf("."));
                String uuid = UUID.randomUUID().toString();
                String newFileName = uuid + ext;

                Path sourcePath = file.toPath();
                Path targetPath = Path.of(BASE_DIR + newFileName);
                Files.move(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);

                String relativePath = "/images/acc/" + newFileName;

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

    /* ===============================================================
       [3] 숙소 mainImage 랜덤 배정 (UUID 파일만 사용 & Image 테이블 저장)
       =============================================================== */
    @Transactional
    public void assignAccMainImages() {
        // CONTENTID가 NULL인 숙소만 필터링 (내부 등록 항목)
        List<Acc> accList = accRepository.findAll().stream()
                .filter(acc -> acc.getContentId() == null)
                .toList();

        int success = 0;
        int failed = 0;

        for (Acc acc : accList) {
            try {
                String folder = getFolderByCategory(acc.getCategory());
                File dir = new File(UPDATE_DIR + folder);
                if (!dir.exists() || !dir.isDirectory()) continue;

                // RANDOM 하위 폴더의 모든 이미지 파일을 대상으로 함
                File[] imgs = dir.listFiles((d, n) ->
                        n.matches(".*\\.(jpg|jpeg|png|webp|JPG|JPEG|PNG|WEBP)$"));

                if (imgs == null || imgs.length == 0) {
                    log.warn("⚠️ '{}' 폴더에 이미지 파일이 없습니다. 매칭 스킵.", folder);
                    continue;
                }

                // 이미지 파일 중 랜덤으로 하나 선택
                File chosen = imgs[random.nextInt(imgs.length)];

                String fileName = chosen.getName();
                String uuidName = fileName.substring(0, fileName.lastIndexOf("."));
                // 상대 경로 생성 (예: /images/random/hotel/uuid-file-name.jpg)
                String relativePath = "/images/random/" + folder + "/" + fileName;

                // 1. Acc 테이블 업데이트: 숙소의 mainImage에 경로 배정 (덮어씌우기)
                acc.updateMainImage(relativePath);
                accRepository.save(acc);

                // ⭐️ 2. Image 테이블에 등록: 경로 중복 체크를 제거하고 ACC ID별로 무조건 저장합니다.
                //    (SQL 삭제 후 이 배치를 실행하면 모든 숙소에 대해 레코드가 생성됩니다.)
                Image image = Image.builder()
                        .targetType("ACC")
                        .targetId(acc.getAccId()) // ACC ID별로 레코드 생성
                        .path(relativePath)
                        .uuidName(uuidName)
                        .originalName(fileName) // UUID 파일명이 원본 역할
                        .build();
                imageRepository.save(image);

                log.info("🏨 숙소 '{}' ({}) → {}", acc.getTitle(), folder, relativePath);
                success++;
            } catch (Exception e) {
                failed++;
                log.error("❌ 숙소 이미지 배정 실패: {}", acc.getTitle(), e);
            }
        }

        log.info("🎯 숙소 이미지 배정 완료 (ACC ID별 이미지 등록) → 성공: {}건 / 실패: {}건", success, failed);
    }


    private String getFolderByCategory(String category) {
        if (category == null) return "normal";
        String c = category.toLowerCase();
        if (c.contains("호텔") || c.contains("콘도,리조트") || c.contains("모텔")) return "hotel";
        if (c.contains("펜션") || c.contains("게스트하우스") || c.contains("민박")) return "pension";
        return "normal";
    }

    /* ===============================================================
       [4] 객실 썸네일 랜덤 배정
       =============================================================== */
    public void assignRoomThumbnails() {
        List<Room> roomList = roomRepository.findAll();
        File dir = new File(UPDATE_DIR + "room");

        File[] imgs = dir.listFiles((d, n) ->
                n.matches(".*\\.(jpg|jpeg|png|webp|JPG|JPEG|PNG|WEBP)$"));
        if (imgs == null || imgs.length == 0) {
            log.warn("⚠️ 객실 이미지 폴더가 비었습니다: {}", dir.getAbsolutePath());
            return;
        }

        int success = 0;
        int failed = 0;

        for (Room room : roomList) {
            try {
                File chosen = imgs[random.nextInt(imgs.length)];
                String relativePath = "/images/random/room/" + chosen.getName();

                room.updateMainImage(relativePath);
                roomRepository.save(room);

                boolean exists = imageRepository.existsByPath(relativePath);
                if (!exists) {
                    Image image = Image.builder()
                            .targetType("ROOM")
                            .targetId(room.getRoomId())
                            .path(relativePath)
                            .originalName(chosen.getName())
                            .build();
                    imageRepository.save(image);
                }

                log.info("🛏 객실 '{}' → {}", room.getRoomName(), relativePath);
                success++;
            } catch (Exception e) {
                failed++;
                log.error("❌ 객실 이미지 처리 실패: {}", room.getRoomName(), e);
            }
        }

        log.info("🎯 객실 이미지 배정 완료 → 성공: {}건 / 실패: {}건", success, failed);
    }

    private String extractSubfolder(String path) {
        try {
            String[] parts = path.split("/");
            int idx = Arrays.asList(parts).indexOf("random");
            if (idx != -1 && idx + 1 < parts.length) return parts[idx + 1];
        } catch (Exception ignored) {}
        return "normal";
    }

    /* ===============================================================
       [5] 강제 썸네일 재생성 (무조건 전부)
       =============================================================== */
    @Transactional
    public void regenerateAllThumbnails() {
        List<Acc> accList = accRepository.findAll().stream()
                .filter(acc -> acc.getMainImage() != null)
                .toList();

        File thumbDir = new File(THUMB_DIR);
        if (!thumbDir.exists()) thumbDir.mkdirs();

        log.info("🚀 썸네일 강제 재생성 시작 - 총 {}개", accList.size());

        int success = 0, failed = 0, updated = 0;

        // ✅ 순차 처리 (병렬 X) — DB 일관성 우선
        for (Acc acc : accList) {
            try {
                String mainImagePath = acc.getMainImage();
                String fileName = Path.of(mainImagePath).getFileName().toString();

                Path sourcePath;
                if (mainImagePath.contains("/random/")) {
                    sourcePath = Path.of("../images/random", extractSubfolder(mainImagePath), fileName);
                } else if (mainImagePath.contains("/acc/")) {
                    sourcePath = Path.of(BASE_DIR, fileName);
                } else {
                    sourcePath = Path.of(BASE_DIR, fileName);
                }

                Path thumbPath = Path.of(THUMB_DIR, fileName);

                // ✅ 원본 이미지 존재 확인
                if (!Files.exists(sourcePath)) {
                    log.warn("⚠️ 원본 없음 → {}", sourcePath);
                    continue;
                }

                // ✅ 썸네일이 없거나 덮어쓰기 허용
                Thumbnails.of(sourcePath.toFile())
                        .size(400, 300)
                        .outputFormat("jpg")
                        .allowOverwrite(true)
                        .toFile(thumbPath.toFile());

                // ✅ DB 반영 — 썸네일 경로로 강제 갱신
                acc.updateMainImage("/images/thumb/" + fileName);
                accRepository.save(acc);
                updated++;
                success++;

                log.debug("🏨 {} → /images/thumb/{}", acc.getTitle(), fileName);

            } catch (Exception e) {
                failed++;
                log.error("❌ 썸네일 생성 실패: {}", acc.getTitle(), e);
            }
        }

        log.info("🎯 썸네일 재생성 완료 → 생성: {} / DB갱신: {} / 실패: {}", success, updated, failed);
    }
}
