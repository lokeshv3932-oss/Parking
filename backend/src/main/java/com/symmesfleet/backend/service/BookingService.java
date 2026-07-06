package com.symmesfleet.backend.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.symmesfleet.backend.domain.Booking;
import com.symmesfleet.backend.domain.BookingStatus;
import com.symmesfleet.backend.exception.NotFoundException;
import com.symmesfleet.backend.repository.BookingRepository;
import com.symmesfleet.backend.web.dto.BookingDto;
import com.symmesfleet.backend.web.dto.CreateBookingRequest;
import com.symmesfleet.backend.web.dto.CreateBookingResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingWriteOps bookingWriteOps;
    private final long holdMinutes;

    public BookingService(
            BookingRepository bookingRepository,
            BookingWriteOps bookingWriteOps,
            @Value("${app.booking.hold-minutes}") long holdMinutes
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingWriteOps = bookingWriteOps;
        this.holdMinutes = holdMinutes;
    }

    public CreateBookingResponse createBooking(CreateBookingRequest request) {
        if (!request.startDate().isBefore(request.endDate())) {
            throw new IllegalArgumentException("endDate must be after startDate");
        }

        Booking booking = bookingWriteOps.insertPendingBooking(request, holdMinutes);

        PaymentIntent intent;
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount((long) booking.getAmountCents())
                    .setCurrency("usd")
                    .putMetadata("bookingId", String.valueOf(booking.getId()))
                    .putMetadata("spotNumber", booking.getSpot().getSpotNumber())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();
            intent = PaymentIntent.create(params);
        } catch (StripeException e) {
            throw new RuntimeException("Payment initialization failed: " + e.getMessage(), e);
        }

        bookingWriteOps.attachPaymentIntent(booking.getId(), intent.getId());

        return new CreateBookingResponse(booking.getId(), intent.getClientSecret(), booking.getAmountCents(), BookingStatus.PENDING_PAYMENT);
    }

    public Page<BookingDto> listBookings(BookingStatus status, Pageable pageable) {
        Page<Booking> page = status != null
                ? bookingRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                : bookingRepository.findAllByOrderByCreatedAtDesc(pageable);
        return page.map(BookingDto::from);
    }

    public BookingDto updateStatus(Long bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));
        booking.setStatus(newStatus);
        return BookingDto.from(bookingRepository.save(booking));
    }
}
