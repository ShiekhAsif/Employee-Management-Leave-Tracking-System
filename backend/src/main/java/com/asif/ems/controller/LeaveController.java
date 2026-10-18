package com.asif.ems.controller;

import com.asif.ems.dto.LeaveCreateRequest;
import com.asif.ems.dto.LeaveResponse;
import com.asif.ems.dto.LeaveStatusUpdate;
import com.asif.ems.entity.Employee;
import com.asif.ems.entity.LeaveApplication;
import com.asif.ems.entity.LeaveStatus;
import com.asif.ems.repository.EmployeeRepository;
import com.asif.ems.repository.LeaveApplicationRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {
    private final LeaveApplicationRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveController(LeaveApplicationRepository leaveRepository, EmployeeRepository employeeRepository) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<LeaveResponse> getLeaves(@AuthenticationPrincipal UserDetails userDetails) {
        Employee currentEmployee = findEmployee(userDetails.getUsername());
        boolean admin = userDetails.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        List<LeaveApplication> leaves = admin
                ? leaveRepository.findAllByOrderByCreatedAtDesc()
                : leaveRepository.findAllByEmployeeIdOrderByCreatedAtDesc(currentEmployee.getId());
        return leaves.stream().map(LeaveController::toResponse).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public LeaveResponse createLeave(@AuthenticationPrincipal UserDetails userDetails,
                                     @Valid @RequestBody LeaveCreateRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date cannot be before start date");
        }
        Employee employee = findEmployee(userDetails.getUsername());
        LeaveApplication leave = new LeaveApplication();
        leave.setEmployee(employee);
        leave.setStartDate(request.startDate());
        leave.setEndDate(request.endDate());
        leave.setReason(request.reason().trim());
        leave.setStatus(LeaveStatus.PENDING);
        return toResponse(leaveRepository.save(leave));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public LeaveResponse updateStatus(@PathVariable Long id, @Valid @RequestBody LeaveStatusUpdate request) {
        if (request.status() == LeaveStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be APPROVED or REJECTED");
        }
        LeaveApplication leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Leave request not found"));
        leave.setStatus(request.status());
        return toResponse(leaveRepository.save(leave));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void cancelLeave(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        LeaveApplication leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Leave request not found"));
        boolean admin = userDetails.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        boolean owner = leave.getEmployee().getEmail().equalsIgnoreCase(userDetails.getUsername());
        if (!admin && !owner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own leave requests");
        }
        if (!admin && leave.getStatus() != LeaveStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending leave requests can be cancelled");
        }
        leaveRepository.delete(leave);
    }

    private Employee findEmployee(String email) {
        return employeeRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee account not found"));
    }

    private static LeaveResponse toResponse(LeaveApplication leave) {
        Employee e = leave.getEmployee();
        return new LeaveResponse(leave.getId(), e.getId(), e.getFullName(), e.getEmail(),
                leave.getStartDate(), leave.getEndDate(), leave.getReason(), leave.getStatus(), leave.getCreatedAt());
    }
}
