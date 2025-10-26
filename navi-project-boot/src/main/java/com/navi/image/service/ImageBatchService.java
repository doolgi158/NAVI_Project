package com.navi.image.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.repository.AccRepository;
import com.navi.image.domain.Image;
import com.navi.image.repository.ImageRepository;
import com.navi.room.domain.Room;
import com.navi.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageBatchService {
    private final RoomRepository roomRepository;
    private final ImageRepository imageRepository;
    private final AccRepository accRepository;

    /* 상대경로 기준 (프로젝트 루트 하위 images/acc) */
    private static final String BASE_DIR = "../images/acc/";

    /* 숙소 이미지 폴더를 순회하며 DB에 Image 등록 (파일명 UUID로 rename) */
    public void insertAccImagesFromFolder() {
        File folder = new File(BASE_DIR);

        if (!folder.exists() || !folder.isDirectory()) {
            log.warn("⚠️ 숙소 이미지 폴더가 존재하지 않습니다: {}", BASE_DIR);
            return;
        }

        // 이미지 파일 필터 (대소문자 무관)
        File[] files = folder.listFiles((dir, name) -> name.matches(".*\\.(jpg|jpeg|png|webp|JPG|JPEG|PNG|WEBP)$"));
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

                // ✅ 새 파일명 (UUID)
                String ext = fileName.substring(fileName.lastIndexOf("."));
                String uuid = UUID.randomUUID().toString();
                String newFileName = uuid + ext;

                // ✅ 파일 rename (UUID 기반)
                Path sourcePath = file.toPath();
                Path targetPath = Path.of(BASE_DIR + newFileName);
                Files.move(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);

                // ✅ DB 저장용 경로
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

    /**
     * 파일명에서 숙소명 추출 ("_" 앞부분)
     */
    private String extractAccName(String fileName) {
        try {
            return fileName.split("_")[0];
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * ✅ 이미 UUID로 변경된 파일은 스킵하고, 아직 변경 안 된 파일만 처리
     */
    public void insertAccImagesOnlyNonUUID() {
        File folder = new File(BASE_DIR);

        if (!folder.exists() || !folder.isDirectory()) {
            log.warn("⚠️ 숙소 이미지 폴더가 존재하지 않습니다: {}", BASE_DIR);
            return;
        }

        File[] files = folder.listFiles((dir, name) -> name.matches(".*\\.(jpg|jpeg|png|webp|JPG|JPEG|PNG|WEBP)$"));
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

                // ✅ 이미 UUID 기반이면 스킵
                if (fileName.matches("^[0-9a-fA-F\\-]{36}\\..+$")) {
                    skipped++;
                    continue;
                }

                String accName = extractAccName(fileName);
                if (fileName.matches("^[0-9a-fA-F\\-]{36}\\.[a-zA-Z0-9]+$")) {
                    skipped++;
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

                // ✅ 새 파일명 (UUID)
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

    /* 이미지 루트 디렉토리 */
    private static final String UPDATE_DIR = "../images/random/";
    private final Random random = new Random();

    /* ✅ 숙소 mainImage 랜덤 배정 (UUID rename, 복사 제거, 중복 방지) */
    public void assignAccMainImages() {
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

                File[] imgs = dir.listFiles((d, n) -> n.matches(".*\\.(jpg|jpeg|png|webp)$"));
                if (imgs == null || imgs.length == 0) continue;

                File chosen = imgs[random.nextInt(imgs.length)];

                // ✅ 이미 UUID 기반 파일이면 rename 스킵
                if (!chosen.getName().matches("^[0-9a-fA-F\\-]{36}\\..+$")) {
                    String ext = chosen.getName().substring(chosen.getName().lastIndexOf("."));
                    String uuid = UUID.randomUUID().toString();
                    String newFileName = uuid + ext;

                    Path sourcePath = chosen.toPath();
                    Path targetPath = Path.of(UPDATE_DIR + folder + "/" + newFileName);

                    // 실제 rename (복사 없이 이동)
                    Files.move(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
                    log.info("🔁 파일명 변경: {} → {}", chosen.getName(), newFileName);

                    chosen = targetPath.toFile(); // 이후 경로 갱신
                }

                // ✅ 경로 생성
                String relativePath = "/images/random/" + folder + "/" + chosen.getName();

                // 숙소 엔티티 업데이트
                acc.updateMainImage(relativePath);
                accRepository.save(acc);

                // ✅ 중복 Image 방지
                boolean exists = imageRepository.existsByPath(relativePath);
                if (!exists) {
                    Image image = Image.builder()
                            .targetType("ACC")
                            .targetId(acc.getAccId())
                            .path(relativePath)
                            .uuidName(chosen.getName().substring(0, chosen.getName().lastIndexOf(".")))
                            .originalName(chosen.getName())
                            .build();
                    imageRepository.save(image);
                }

                log.info("🏨 숙소 '{}' ({}) → {}", acc.getTitle(), folder, relativePath);
                success++;

            } catch (Exception e) {
                failed++;
                log.error("❌ 숙소 이미지 처리 실패: {}", acc.getTitle(), e);
            }
        }

        log.info("🎯 숙소 이미지 배정 완료 → 성공: {}건 / 실패: {}건", success, failed);
    }

    /* ✅ 객실 thumbnailImage 랜덤 배정 (UUID rename, 복사 제거, 중복 방지) */
    public void assignRoomThumbnails() {
        List<Room> roomList = roomRepository.findAll();
        File dir = new File(UPDATE_DIR + "room");

        File[] imgs = dir.listFiles((d, n) -> n.matches(".*\\.(jpg|jpeg|png|webp|JPG|JPEG|PNG|WEBP)$"));
        if (imgs == null || imgs.length == 0) {
            log.warn("⚠️ 객실 이미지 폴더가 비었습니다: {}", dir.getAbsolutePath());
            return;
        }

        int success = 0;
        int failed = 0;

        for (Room room : roomList) {
            try {
                // ✅ 랜덤 이미지 선택
                File chosen = imgs[random.nextInt(imgs.length)];
                String relativePath = "/images/random/room/" + chosen.getName();

                // ✅ 객실 엔티티 업데이트 (mainImage에 바로 경로 저장)
                room.updateMainImage(relativePath);
                roomRepository.save(room);

                // ✅ Image 테이블 등록 (중복 방지)
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


    /** 카테고리에 따른 폴더 매핑 */
    private String getFolderByCategory(String category) {
        if (category == null) return "normal";
        String c = category.toLowerCase();
        if (c.contains("호텔") || c.contains("리조트") || c.contains("콘도") || c.contains("모텔")) return "hotel";
        if (c.contains("펜션")) return "pension";
        return "normal";
    }


}