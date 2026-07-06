package com.symmesfleet.backend.web.admin;

import com.symmesfleet.backend.domain.BookingStatus;
import com.symmesfleet.backend.service.BookingService;
import com.symmesfleet.backend.web.dto.BookingDto;
import com.symmesfleet.backend.web.dto.StatusUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/bookings")
public class AdminBookingController {

    private final BookingService bookingService;

    public AdminBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public Page<BookingDto> list(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return bookingService.listBookings(status, pageable);
    }

    @PatchMapping("/{id}")
    public BookingDto updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        BookingStatus status = BookingStatus.valueOf(request.status().toUpperCase());
        return bookingService.updateStatus(id, status);
    }
}
