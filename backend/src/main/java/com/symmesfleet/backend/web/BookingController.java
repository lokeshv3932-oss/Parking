package com.symmesfleet.backend.web;

import com.symmesfleet.backend.service.BookingService;
import com.symmesfleet.backend.web.dto.CreateBookingRequest;
import com.symmesfleet.backend.web.dto.CreateBookingResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateBookingResponse create(@Valid @RequestBody CreateBookingRequest request) {
        return bookingService.createBooking(request);
    }
}
