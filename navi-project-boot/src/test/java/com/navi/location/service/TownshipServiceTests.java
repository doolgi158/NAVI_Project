package com.navi.location.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class TownshipServiceTests {
    @Autowired
    private TownshipService townshipService;

    @Test
    void insertInitialDataTest() {
        townshipService.insertInitialData();
    }
}
