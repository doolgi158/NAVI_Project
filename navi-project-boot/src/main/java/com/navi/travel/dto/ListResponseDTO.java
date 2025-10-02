package com.navi.travel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ListResponseDTO<E> {

    // 현재 페이지에서 조회된 데이터 목록
    private List<E> dtoList;

    // 총 항목 수
    private int totalCount;

    // 총 페이지 수
    private int totalPage;

    // 현재 페이지 번호
    private int current;

    // 이전 페이지 버튼 활성화 여부
    private boolean prev;

    // 다음 페이지 버튼 활성화 여부
    private boolean next;

    // 시작 페이지 번호 (페이지네이션 블록)
    private int startPage;

    // 끝 페이지 번호 (페이지네이션 블록)
    private int endPage;

    /**
     * 페이지네이션 버튼 목록 (예: [1, 2, 3, 4, 5])
     * 실제로는 startPage와 endPage를 기반으로 클라이언트에서 생성할 수도 있으나,
     * 서버에서 직접 목록을 전달하면 편리합니다.
     */
    private List<Integer> pageNumList;
}