package com.navi.travel.config;

import com.navi.travel.domain.Travel;
import com.navi.travel.dto.TravelApiItemDTO;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {
    /**
     * DTO와 Entity 간의 매핑을 위한 ModelMapper
     */
    @Bean
     ModelMapper getMapper(){
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setFieldMatchingEnabled(true)
                .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
                .setMatchingStrategy(MatchingStrategies.LOOSE); //필드의 이름만 같으면 상위 경로가 달라도 매핑을 시도


        //TravelApiItemDTO -> Travel 매핑 규칙 정의
        modelMapper.createTypeMap(TravelApiItemDTO.class, Travel.class)
                //위도,경도 매핑
                .addMapping(TravelApiItemDTO::getLatitude, Travel::setLatitude)
                .addMapping(TravelApiItemDTO::getLongitude, Travel::setLongitude)

                // 주소/전화번호 매핑
                .addMapping(TravelApiItemDTO::getZipcode, Travel::setZipcode)
                .addMapping(TravelApiItemDTO::getTel, Travel::setTel)

                // 헬퍼 메서드를 사용하여 Null-Safe하게 엔티티의 imagePath로 매핑
                .addMapping(TravelApiItemDTO::getSafeImagePath, Travel::setImagePath)
                // 헬퍼 메서드를 사용하여 Null-Safe하게 엔티티의 thumbnailPath로 매핑
                .addMapping(TravelApiItemDTO::getSafeThumbnailPath, Travel::setThumbnailPath)

                //헬퍼 메서드 사용하여 photoId로 매핑
                .addMapping(TravelApiItemDTO::getSafePhotoId, Travel::setPhotoId);



        return modelMapper;
    }

    /**
     * 외부 API 호출을 위한 RestTemplate
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
