package com.navi.accommodation.service;

import com.navi.accommodation.repository.AccRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccServiceImpl implements AccService{
    public final AccRepository accRepository;

//    @Override
//    public List<Acc> accList() {
//        List<Acc> accList = (List<Acc>) accRepository.findByTitle()
//    }
}
