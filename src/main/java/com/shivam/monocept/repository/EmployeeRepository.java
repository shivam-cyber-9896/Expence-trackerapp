package com.shivam.monocept.repository;

import com.shivam.monocept.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    Optional<Employee> findByEmail(String email);
    boolean existsByDepartmentDepartmentId(Long departmentId);
}
