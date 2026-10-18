package com.asif.ems.dto;

import com.asif.ems.entity.LeaveStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record LeaveResponse(
        Long id,
        Long employeeId,
        String employeeName,
        String employeeEmail,
        LocalDate startDate,
        LocalDate endDate,
        String reason,
        LeaveStatus status,
        LocalDateTime createdAt
) { }
