package com.navi.notice.service;

import com.navi.notice.dto.NoticeDTO;
import com.navi.notice.entity.Notice;
import com.navi.notice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NoticeService {    //데이터 조회, 생성, 수정, 삭제 담당

    private final NoticeRepository noticeRepository;

    // Entity -> DTO 변환
    private NoticeDTO convertToDTO(Notice notice) {
        return NoticeDTO.builder()
                .noticeNo(notice.getNoticeNo())
                .noticeTitle(notice.getNoticeTitle())
                .noticeFile(notice.getNoticeFile())
                .noticeContent(notice.getNoticeContent())
                .createDate(notice.getCreateDate())
                .updateDate(notice.getUpdateDate())
                .noticeViewCount(notice.getNoticeViewCount())
                .noticeStartDate(notice.getNoticeStartDate())
                .noticeEndDate(notice.getNoticeEndDate())
                .noticeAttachFile(notice.getNoticeAttachFile())
                .build();
    }

    // DTO -> Entity 변환
    private Notice convertToEntity(NoticeDTO dto) {
        return Notice.builder()
                .noticeNo(dto.getNoticeNo())
                .noticeTitle(dto.getNoticeTitle())
                .noticeFile(dto.getNoticeFile())
                .noticeContent(dto.getNoticeContent())
                .noticeViewCount(dto.getNoticeViewCount())
                .noticeStartDate(dto.getNoticeStartDate())
                .noticeEndDate(dto.getNoticeEndDate())
                .noticeAttachFile(dto.getNoticeAttachFile())
                .build();
    }

    // 공지사항 전체 목록 조회
    public List<NoticeDTO> getAllNotices() {
        return noticeRepository.findAllByOrderByCreateDateDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 공지사항 상세 조회 (조회수 증가)
    public NoticeDTO getNoticeById(Integer noticeNo) {
        Notice notice = noticeRepository.findById(noticeNo)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

        // 조회수 증가
        noticeRepository.incrementViewCount(noticeNo);

        return convertToDTO(notice);
    }

    // 공지사항 작성
    public NoticeDTO createNotice(NoticeDTO noticeDTO) {
        Notice notice = convertToEntity(noticeDTO);
        Notice savedNotice = noticeRepository.save(notice);
        return convertToDTO(savedNotice);
    }

    // 공지사항 수정
    public NoticeDTO updateNotice(Integer noticeNo, NoticeDTO noticeDTO) {
        Notice notice = noticeRepository.findById(noticeNo)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

        // 수정할 내용 업데이트
        notice.setNoticeTitle(noticeDTO.getNoticeTitle());
        notice.setNoticeContent(noticeDTO.getNoticeContent());
        notice.setNoticeFile(noticeDTO.getNoticeFile());
        notice.setNoticeAttachFile(noticeDTO.getNoticeAttachFile());
        notice.setNoticeStartDate(noticeDTO.getNoticeStartDate());
        notice.setNoticeEndDate(noticeDTO.getNoticeEndDate());

        Notice updatedNotice = noticeRepository.save(notice);
        return convertToDTO(updatedNotice);
    }

    // 공지사항 삭제
    public void deleteNotice(Integer noticeNo) {
        if (!noticeRepository.existsById(noticeNo)) {
            throw new RuntimeException("공지사항을 찾을 수 없습니다.");
        }
        noticeRepository.deleteById(noticeNo);
    }

    // 공지사항 검색
    public List<NoticeDTO> searchNotices(String keyword) {
        return noticeRepository.findByNoticeTitleContainingOrderByCreateDateDesc(keyword)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}