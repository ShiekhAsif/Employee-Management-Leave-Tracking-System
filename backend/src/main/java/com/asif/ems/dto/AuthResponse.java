package com.asif.ems.dto;

import com.asif.ems.entity.Role;

public record AuthResponse(
        String token,
        Long id,
        String fullName,
        String email,
        Role role
) { }
