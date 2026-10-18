package com.asif.ems.config;

import com.asif.ems.entity.Employee;
import com.asif.ems.entity.Role;
import com.asif.ems.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedDemoAccounts(EmployeeRepository employees, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!employees.existsByEmailIgnoreCase("admin@example.com")) {
                Employee admin = new Employee();
                admin.setFullName("System Administrator");
                admin.setEmail("admin@example.com");
                admin.setPassword(passwordEncoder.encode("Admin@12345"));
                admin.setDepartment("Administration");
                admin.setDesignation("HR Administrator");
                admin.setSalary(new BigDecimal("75000.00"));
                admin.setJoiningDate(LocalDate.now().minusYears(3));
                admin.setRole(Role.ADMIN);
                employees.save(admin);
            }

            if (!employees.existsByEmailIgnoreCase("employee@example.com")) {
                Employee employee = new Employee();
                employee.setFullName("Demo Employee");
                employee.setEmail("employee@example.com");
                employee.setPassword(passwordEncoder.encode("Employee@123"));
                employee.setDepartment("Engineering");
                employee.setDesignation("Software Engineer");
                employee.setSalary(new BigDecimal("45000.00"));
                employee.setJoiningDate(LocalDate.now().minusMonths(8));
                employee.setRole(Role.EMPLOYEE);
                employees.save(employee);
            }
        };
    }
}
