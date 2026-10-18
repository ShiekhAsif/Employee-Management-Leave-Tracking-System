package com.asif.ems.dto;

import com.asif.ems.entity.Role;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeCreateRequest(
        @NotBlank @Size(max = 100) String fullName,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotBlank @Size(max = 80) String department,
        @NotBlank @Size(max = 100) String designation,
        @NotNull @DecimalMin("0.0") BigDecimal salary,
        @NotNull LocalDate joiningDate,
        Role role
) { }
