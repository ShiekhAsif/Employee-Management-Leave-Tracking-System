package com.asif.ems.controller;

import com.asif.ems.dto.EmployeeCreateRequest;
import com.asif.ems.dto.EmployeeResponse;
import com.asif.ems.dto.EmployeeUpdateRequest;
import com.asif.ems.entity.Employee;
import com.asif.ems.entity.Role;
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
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeRepository employeeRepository;
    private final LeaveApplicationRepository leaveRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public EmployeeController(EmployeeRepository employeeRepository,
                              LeaveApplicationRepository leaveRepository,
                              org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.leaveRepository = leaveRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public EmployeeResponse getCurrentEmployee(@AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = findByEmail(userDetails.getUsername());
        return toResponse(employee);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream().map(EmployeeController::toResponse).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeResponse createEmployee(@Valid @RequestBody EmployeeCreateRequest request) {
        if (employeeRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An employee with this email already exists");
        }

        Employee employee = new Employee();
        employee.setFullName(request.fullName().trim());
        employee.setEmail(request.email().trim().toLowerCase());
        employee.setPassword(passwordEncoder.encode(request.password()));
        employee.setDepartment(request.department().trim());
        employee.setDesignation(request.designation().trim());
        employee.setSalary(request.salary());
        employee.setJoiningDate(request.joiningDate());
        employee.setRole(request.role() == null ? Role.EMPLOYEE : request.role());
        return toResponse(employeeRepository.save(employee));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeResponse updateEmployee(@PathVariable Long id,
                                           @Valid @RequestBody EmployeeUpdateRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        employeeRepository.findByEmailIgnoreCase(request.email()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "An employee with this email already exists");
            }
        });

        employee.setFullName(request.fullName().trim());
        employee.setEmail(request.email().trim().toLowerCase());
        employee.setDepartment(request.department().trim());
        employee.setDesignation(request.designation().trim());
        employee.setSalary(request.salary());
        employee.setJoiningDate(request.joiningDate());
        if (request.role() != null) employee.setRole(request.role());
        return toResponse(employeeRepository.save(employee));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteEmployee(@PathVariable Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found");
        }
        leaveRepository.deleteAllByEmployeeId(id);
        employeeRepository.deleteById(id);
    }

    private Employee findByEmail(String email) {
        return employeeRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee account not found"));
    }

    private static EmployeeResponse toResponse(Employee e) {
        return new EmployeeResponse(e.getId(), e.getFullName(), e.getEmail(), e.getDepartment(),
                e.getDesignation(), e.getSalary(), e.getJoiningDate(), e.getRole());
    }
}
