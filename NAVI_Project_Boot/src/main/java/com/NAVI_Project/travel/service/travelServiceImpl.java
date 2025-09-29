package com.NAVI_Project.travel.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class travelServiceImpl implements travelService{
    @Value("${api.travel.key}")
    private String travelApiKey;
}
