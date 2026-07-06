package com.symmesfleet.backend.web.dto;

public record DashboardSummary(
        long totalSpots,
        long occupiedSpots,
        long availableSpots,
        long confirmedBookings,
        long pendingPaymentBookings,
        long pendingMechanicRequests
) {
}
