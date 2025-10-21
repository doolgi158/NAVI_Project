package com.navi.delivery.admin.service;

import com.navi.delivery.admin.dto.AdminBagDTO;

import java.util.List;

public interface AdminBagService {

    List<AdminBagDTO> getAllBags();

    AdminBagDTO getBagById(Long id);

    AdminBagDTO createBag(AdminBagDTO dto);

    AdminBagDTO updateBag(Long id, AdminBagDTO dto);

    void deleteBag(Long id);
}
