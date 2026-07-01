package com.shivam.monocept.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @NotBlank(message = "Action is required")
    @Size(max = 100, message = "Action cannot exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String action;

    @NotBlank(message = "Performed by is required")
    @Size(max = 100, message = "Performed by cannot exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String performedBy;

    @Column(updatable = false)
    private LocalDateTime actionTime = LocalDateTime.now();

    @NotBlank(message = "Entity name is required")
    @Size(max = 100, message = "Entity name cannot exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String entityName;

    private Long entityId;
}