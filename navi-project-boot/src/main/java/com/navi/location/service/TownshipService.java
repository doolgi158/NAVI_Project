package com.navi.location.service;

import com.navi.location.domain.Township;
import com.navi.location.repository.TownshipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TownshipService {
    @Autowired
    private TownshipRepository townshipRepository;

    @Transactional
    public void insertInitialData() {
        if(townshipRepository.count() > 0) {
            System.out.println("NAVI_TOWNSHIP 테이블은 초기화되었습니다.");
            return;
        }

        // 불변 리스트 생성 메서드 (추가, 삭제 등의 수정 작업 불가)
        List<Township> data = List.of(
                new Township(0L, 0, "미지정", "미지정"),
                new Township(null, 110, "제주시", "제주시내"),
                new Township(null, 110, "제주시", "애월읍"),
                new Township(null, 110, "제주시", "한림읍"),
                new Township(null, 110, "제주시", "조천읍"),
                new Township(null, 110, "제주시", "구좌읍"),
                new Township(null, 110, "제주시", "추자면"),
                new Township(null, 110, "제주시", "우도면"),
                new Township(null, 110, "제주시", "한경면"),
                new Township(null, 130, "서귀포시", "서귀포시내"),
                new Township(null, 130, "서귀포시", "대정읍"),
                new Township(null, 130, "서귀포시", "남원읍"),
                new Township(null, 130, "서귀포시", "성산읍"),
                new Township(null, 130, "서귀포시", "안덕면"),
                new Township(null, 130, "서귀포시", "표선면")
        );

        // 여러 엔티티 일괄 저장 - 리스트 형태의 여러 객체를 한 번에 INSERT
        townshipRepository.saveAll(data);
        System.out.println("NAVI_TOWNSHIP 초기 데이터 삽입 완료 (" + data.size() + "건)");
    }
}
