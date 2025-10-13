package com.navi.travel.service.internal;

public interface TravelActionService {
    boolean toggleBookmark(Long travelId, String id);

    boolean toggleLike(Long travelId, String id);

    void incrementViews(Long travelId);
}
