package com.symmesfleet.backend.service;

import com.symmesfleet.backend.AbstractIntegrationTest;
import com.symmesfleet.backend.domain.Booking;
import com.symmesfleet.backend.domain.BookingStatus;
import com.symmesfleet.backend.domain.ParkingSpot;
import com.symmesfleet.backend.repository.BookingRepository;
import com.symmesfleet.backend.repository.ParkingSpotRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;

class BookingConfirmationIdempotencyTest extends AbstractIntegrationTest {

    @Autowired
    private ParkingSpotRepository spotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    void confirmIfPendingIsIdempotentAcrossDuplicateWebhookDeliveries() {
        ParkingSpot spot = spotRepository.findAllByOrderBySpotNumber().get(2);

        Booking booking = new Booking();
        booking.setSpot(spot);
        booking.setStartDate(LocalDate.of(2026, 10, 1));
        booking.setEndDate(LocalDate.of(2026, 10, 5));
        booking.setCustomerName("Jane Doe");
        booking.setCustomerEmail("jane@example.com");
        booking.setAmountCents(2800);
        booking.setStatus(BookingStatus.PENDING_PAYMENT);
        booking.setStripePaymentIntentId("pi_test_idempotency");
        booking.setHoldExpiresAt(Instant.now().plus(15, ChronoUnit.MINUTES));
        booking = bookingRepository.saveAndFlush(booking);

        int firstDelivery = bookingRepository.confirmIfPending("pi_test_idempotency");
        int secondDelivery = bookingRepository.confirmIfPending("pi_test_idempotency");

        assertThat(firstDelivery).isEqualTo(1);
        assertThat(secondDelivery).isEqualTo(0);

        Booking reloaded = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(reloaded.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    void expireStaleHoldsFreesUpAbandonedBookings() {
        ParkingSpot spot = spotRepository.findAllByOrderBySpotNumber().get(3);

        Booking booking = new Booking();
        booking.setSpot(spot);
        booking.setStartDate(LocalDate.of(2026, 11, 1));
        booking.setEndDate(LocalDate.of(2026, 11, 5));
        booking.setCustomerName("Late Payer");
        booking.setCustomerEmail("late@example.com");
        booking.setAmountCents(2800);
        booking.setStatus(BookingStatus.PENDING_PAYMENT);
        booking.setHoldExpiresAt(Instant.now().minus(1, ChronoUnit.MINUTES));
        booking = bookingRepository.saveAndFlush(booking);

        int expiredCount = bookingRepository.expireStaleHolds(Instant.now());

        assertThat(expiredCount).isGreaterThanOrEqualTo(1);
        Booking reloaded = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(reloaded.getStatus()).isEqualTo(BookingStatus.EXPIRED);
    }
}
