package com.symmesfleet.backend.service;

import com.symmesfleet.backend.domain.Booking;
import com.symmesfleet.backend.domain.BookingStatus;
import com.symmesfleet.backend.domain.ParkingSpot;
import com.symmesfleet.backend.exception.ConflictException;
import com.symmesfleet.backend.exception.NotFoundException;
import com.symmesfleet.backend.repository.BookingRepository;
import com.symmesfleet.backend.repository.ParkingSpotRepository;
import com.symmesfleet.backend.web.dto.CreateBookingRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Isolated bean so the @Transactional boundary is honored via Spring's proxy
 * (self-invocation from within BookingService would otherwise bypass it).
 */
@Component
public class BookingWriteOps {

    private final BookingRepository bookingRepository;
    private final ParkingSpotRepository spotRepository;

    public BookingWriteOps(BookingRepository bookingRepository, ParkingSpotRepository spotRepository) {
        this.bookingRepository = bookingRepository;
        this.spotRepository = spotRepository;
    }

    @Transactional
    public Booking insertPendingBooking(CreateBookingRequest req, long holdMinutes) {
        ParkingSpot spot = spotRepository.findById(req.spotId())
                .filter(ParkingSpot::isActive)
                .orElseThrow(() -> new NotFoundException("Parking spot not found"));

        long overlapping = bookingRepository.countOverlapping(spot.getId(), req.startDate(), req.endDate());
        if (overlapping > 0) {
            throw new ConflictException("This spot is no longer available for the selected dates.");
        }

        long days = ChronoUnit.DAYS.between(req.startDate(), req.endDate());
        int amountCents = (int) (days * spot.getDailyRateCents());

        Booking booking = new Booking();
        booking.setSpot(spot);
        booking.setStartDate(req.startDate());
        booking.setEndDate(req.endDate());
        booking.setCustomerName(req.customerName());
        booking.setCustomerEmail(req.customerEmail());
        booking.setCustomerPhone(req.customerPhone());
        booking.setVehicleInfo(req.vehicleInfo());
        booking.setAmountCents(amountCents);
        booking.setStatus(BookingStatus.PENDING_PAYMENT);
        booking.setHoldExpiresAt(Instant.now().plus(holdMinutes, ChronoUnit.MINUTES));

        return bookingRepository.save(booking);
    }

    @Transactional
    public void attachPaymentIntent(Long bookingId, String paymentIntentId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));
        booking.setStripePaymentIntentId(paymentIntentId);
        bookingRepository.save(booking);
    }
}
