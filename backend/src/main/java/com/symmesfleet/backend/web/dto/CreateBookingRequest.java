package com.symmesfleet.backend.web.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record CreateBookingRequest(
        @NotNull Long spotId,
        @NotNull @FutureOrPresent LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotBlank @Size(max = 255) String customerName,
        @NotBlank @Email @Size(max = 255) String customerEmail,
        @Size(max = 50) String customerPhone,
        @Size(max = 255) String vehicleInfo
) {
}
