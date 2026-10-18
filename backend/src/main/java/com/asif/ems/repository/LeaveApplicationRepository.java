package com.asif.ems.repository;

import com.asif.ems.entity.LeaveApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
    List<LeaveApplication> findAllByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    List<LeaveApplication> findAllByOrderByCreatedAtDesc();
    void deleteAllByEmployeeId(Long employeeId);
}
