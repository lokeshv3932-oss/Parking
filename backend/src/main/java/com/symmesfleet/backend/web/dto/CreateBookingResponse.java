package com.symmesfleet.backend.web.dto;

import com.symmesfleet.backend.domain.BookingStatus;

public record CreateBookingResponse(
        Long bookingId,
        String clientSecret,
        Integer amountCents,
        BookingStatus status
) {
}
