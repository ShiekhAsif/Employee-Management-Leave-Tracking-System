package com.asif.ems.dto;

import com.asif.ems.entity.Role;
import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        String fullName,
        String email,
        String department,
        String designation,
        BigDecimal salary,
        LocalDate joiningDate,
        Role role
) { }
