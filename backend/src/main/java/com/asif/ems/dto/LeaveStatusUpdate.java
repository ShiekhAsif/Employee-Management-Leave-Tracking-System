package com.asif.ems.dto;

import com.asif.ems.entity.LeaveStatus;
import jakarta.validation.constraints.NotNull;

public record LeaveStatusUpdate(@NotNull LeaveStatus status) { }
