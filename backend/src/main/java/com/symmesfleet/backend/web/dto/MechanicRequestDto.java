package com.symmesfleet.backend.web.dto;

import com.symmesfleet.backend.domain.MechanicRequest;
import com.symmesfleet.backend.domain.MechanicRequestStatus;

import java.time.LocalDate;

public record MechanicRequestDto(
        Long id,
        String customerName,
        String customerEmail,
        String customerPhone,
        String vehicleInfo,
        String issueDescription,
        LocalDate preferredDate,
        MechanicRequestStatus status,
        String createdAt
) {
    public static MechanicRequestDto from(MechanicRequest r) {
        return new MechanicRequestDto(
                r.getId(),
                r.getCustomerName(),
                r.getCustomerEmail(),
                r.getCustomerPhone(),
                r.getVehicleInfo(),
                r.getIssueDescription(),
                r.getPreferredDate(),
                r.getStatus(),
                r.getCreatedAt() != null ? r.getCreatedAt().toString() : null
        );
    }
}
