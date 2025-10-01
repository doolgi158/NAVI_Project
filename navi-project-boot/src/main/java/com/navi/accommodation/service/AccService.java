package com.navi.accommodation.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AccApiDTO;

import java.io.IOException;
import java.util.List;

public interface AccService {
    public void loadFromJsonFile() throws IOException;
    public void insertFromApi(AccApiDTO dto);
}
