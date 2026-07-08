package com.symmesfleet.backend.service;

import com.symmesfleet.backend.domain.Customer;
import com.symmesfleet.backend.exception.ConflictException;
import com.symmesfleet.backend.repository.CustomerRepository;
import com.symmesfleet.backend.security.JwtService;
import com.symmesfleet.backend.web.dto.CustomerAuthResponse;
import com.symmesfleet.backend.web.dto.CustomerLoginRequest;
import com.symmesfleet.backend.web.dto.CustomerSignupRequest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomerService {

    private static final String CUSTOMER_ROLE = "ROLE_CUSTOMER";

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public CustomerService(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public CustomerAuthResponse signup(CustomerSignupRequest request) {
        String email = request.email().toLowerCase();
        if (customerRepository.findByEmail(email).isPresent()) {
            throw new ConflictException("An account with this email already exists.");
        }

        Customer customer = new Customer();
        customer.setEmail(email);
        customer.setPasswordHash(passwordEncoder.encode(request.password()));
        customer.setEmailVerified(true);
        customerRepository.save(customer);

        String token = jwtService.generateCustomerToken(customer.getEmail(), CUSTOMER_ROLE);
        return new CustomerAuthResponse(token, customer.getEmail(), jwtService.customerExpirationSeconds());
    }

    public CustomerAuthResponse login(CustomerLoginRequest request) {
        Customer customer = customerRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), customer.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        String token = jwtService.generateCustomerToken(customer.getEmail(), CUSTOMER_ROLE);
        return new CustomerAuthResponse(token, customer.getEmail(), jwtService.customerExpirationSeconds());
    }

    /**
     * Resolves the logged-in customer from the request's JWT, if any was supplied.
     * Used by the (guest-allowed) booking/mechanic-request endpoints to optionally
     * link the record to an account without requiring one.
     */
    public Optional<Customer> currentCustomer() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        boolean isCustomer = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(CUSTOMER_ROLE::equals);
        if (!isCustomer) {
            return Optional.empty();
        }
        String email = authentication.getName();
        return customerRepository.findByEmail(email);
    }
}
