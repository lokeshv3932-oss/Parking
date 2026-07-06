package com.symmesfleet.backend.web.dto;

import com.symmesfleet.backend.domain.Booking;
import com.symmesfleet.backend.domain.BookingStatus;

import java.time.LocalDate;

public record BookingDto(
        Long id,
        String spotNumber,
        String spotType,
        LocalDate startDate,
        LocalDate endDate,
        String customerName,
        String customerEmail,
        String customerPhone,
        String vehicleInfo,
        Integer amountCents,
        BookingStatus status,
        String createdAt
) {
    public static BookingDto from(Booking b) {
        return new BookingDto(
                b.getId(),
                b.getSpot().getSpotNumber(),
                b.getSpot().getSpotType().name(),
                b.getStartDate(),
                b.getEndDate(),
                b.getCustomerName(),
                b.getCustomerEmail(),
                b.getCustomerPhone(),
                b.getVehicleInfo(),
                b.getAmountCents(),
                b.getStatus(),
                b.getCreatedAt() != null ? b.getCreatedAt().toString() : null
        );
    }
}
