//package com.navi.image.repository;
//
//import com.navi.image.domain.Image;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import java.util.Optional;
//
//public interface ImageRepository extends JpaRepository<Image, Long> {
//    Optional<Image> findByUser_No(Long userNo);
//    void deleteByUser_No(Long userNo);
//}
