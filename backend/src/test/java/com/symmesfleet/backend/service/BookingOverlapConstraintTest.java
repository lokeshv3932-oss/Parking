package com.symmesfleet.backend.service;

import com.symmesfleet.backend.AbstractIntegrationTest;
import com.symmesfleet.backend.domain.Booking;
import com.symmesfleet.backend.domain.BookingStatus;
import com.symmesfleet.backend.domain.ParkingSpot;
import com.symmesfleet.backend.repository.BookingRepository;
import com.symmesfleet.backend.repository.ParkingSpotRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BookingOverlapConstraintTest extends AbstractIntegrationTest {

    @Autowired
    private ParkingSpotRepository spotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private Booking bookingFor(ParkingSpot spot, LocalDate start, LocalDate end) {
        Booking booking = new Booking();
        booking.setSpot(spot);
        booking.setStartDate(start);
        booking.setEndDate(end);
        booking.setCustomerName("Test Customer");
        booking.setCustomerEmail("test@example.com");
        booking.setAmountCents(10000);
        booking.setStatus(BookingStatus.PENDING_PAYMENT);
        return booking;
    }

    @Test
    void overlappingActiveBookingsForSameSpotAreRejectedByDbConstraint() {
        ParkingSpot spot = spotRepository.findAllByOrderBySpotNumber().get(0);

        bookingRepository.saveAndFlush(bookingFor(spot, LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 10)));

        assertThatThrownBy(() ->
                bookingRepository.saveAndFlush(bookingFor(spot, LocalDate.of(2026, 8, 5), LocalDate.of(2026, 8, 15)))
        ).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void nonOverlappingBookingsForSameSpotAreAllowed() {
        ParkingSpot spot = spotRepository.findAllByOrderBySpotNumber().get(1);

        bookingRepository.saveAndFlush(bookingFor(spot, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 10)));
        bookingRepository.saveAndFlush(bookingFor(spot, LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 20)));

        assertThat(bookingRepository.countOverlapping(spot.getId(), LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 20)))
                .isEqualTo(2);
    }
}
