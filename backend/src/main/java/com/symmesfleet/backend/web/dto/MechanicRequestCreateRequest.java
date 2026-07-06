package com.symmesfleet.backend.web.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record MechanicRequestCreateRequest(
        @NotBlank @Size(max = 255) String customerName,
        @NotBlank @Email @Size(max = 255) String customerEmail,
        @NotBlank @Size(max = 50) String customerPhone,
        @NotBlank @Size(max = 255) String vehicleInfo,
        @NotBlank @Size(max = 4000) String issueDescription,
        LocalDate preferredDate
) {
}
