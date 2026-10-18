package com.asif.ems.controller;

import com.asif.ems.config.JwtService;
import com.asif.ems.dto.AuthRequest;
import com.asif.ems.dto.AuthResponse;
import com.asif.ems.entity.Employee;
import com.asif.ems.repository.EmployeeRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final EmployeeRepository employeeRepository;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager,
                          EmployeeRepository employeeRepository,
                          JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.employeeRepository = employeeRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (AuthenticationException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        Employee employee = employeeRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return new AuthResponse(jwtService.generateToken(employee), employee.getId(),
                employee.getFullName(), employee.getEmail(), employee.getRole());
    }
}
