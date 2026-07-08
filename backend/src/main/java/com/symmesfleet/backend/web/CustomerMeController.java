package com.symmesfleet.backend.web;

import com.symmesfleet.backend.domain.Customer;
import com.symmesfleet.backend.exception.NotFoundException;
import com.symmesfleet.backend.repository.BookingRepository;
import com.symmesfleet.backend.repository.MechanicRequestRepository;
import com.symmesfleet.backend.service.CustomerService;
import com.symmesfleet.backend.web.dto.BookingDto;
import com.symmesfleet.backend.web.dto.MechanicRequestDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customer/me")
public class CustomerMeController {

    private final CustomerService customerService;
    private final BookingRepository bookingRepository;
    private final MechanicRequestRepository mechanicRequestRepository;

    public CustomerMeController(
            CustomerService customerService,
            BookingRepository bookingRepository,
            MechanicRequestRepository mechanicRequestRepository
    ) {
        this.customerService = customerService;
        this.bookingRepository = bookingRepository;
        this.mechanicRequestRepository = mechanicRequestRepository;
    }

    @GetMapping("/bookings")
    public List<BookingDto> myBookings() {
        Customer customer = currentCustomerOrThrow();
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(BookingDto::from)
                .toList();
    }

    @GetMapping("/mechanic-requests")
    public List<MechanicRequestDto> myMechanicRequests() {
        Customer customer = currentCustomerOrThrow();
        return mechanicRequestRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(MechanicRequestDto::from)
                .toList();
    }

    private Customer currentCustomerOrThrow() {
        return customerService.currentCustomer()
                .orElseThrow(() -> new NotFoundException("Customer not found"));
    }
}
