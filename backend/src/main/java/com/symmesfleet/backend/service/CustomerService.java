package com.symmesfleet.backend.service;

import com.symmesfleet.backend.domain.Customer;
import com.symmesfleet.backend.exception.ConflictException;
import com.symmesfleet.backend.exception.EmailNotVerifiedException;
import com.symmesfleet.backend.exception.NotFoundException;
import com.symmesfleet.backend.repository.CustomerRepository;
import com.symmesfleet.backend.security.JwtService;
import com.symmesfleet.backend.web.dto.CustomerAuthResponse;
import com.symmesfleet.backend.web.dto.CustomerLoginRequest;
import com.symmesfleet.backend.web.dto.CustomerSignupRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomerService {

    private static final String CUSTOMER_ROLE = "ROLE_CUSTOMER";

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final String frontendUrl;

    public CustomerService(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            @Value("${app.frontend-url}") String frontendUrl
    ) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    public void signup(CustomerSignupRequest request) {
        String email = request.email().toLowerCase();
        if (customerRepository.findByEmail(email).isPresent()) {
            throw new ConflictException("An account with this email already exists.");
        }

        Customer customer = new Customer();
        customer.setEmail(email);
        customer.setPasswordHash(passwordEncoder.encode(request.password()));
        customer.setEmailVerified(false);
        issueVerificationToken(customer);
        customerRepository.save(customer);
    }

    public void resendVerification(String email) {
        // Deliberately silent on a missing account or an already-verified one, so this
        // endpoint can't be used to enumerate which emails have accounts.
        customerRepository.findByEmail(email.toLowerCase()).ifPresent(customer -> {
            if (customer.isEmailVerified()) {
                return;
            }
            issueVerificationToken(customer);
            customerRepository.save(customer);
        });
    }

    private void issueVerificationToken(Customer customer) {
        String token = UUID.randomUUID().toString();
        customer.setVerificationToken(token);
        customer.setVerificationTokenExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;
        emailService.sendVerificationEmail(customer.getEmail(), verificationUrl);
    }

    public void verifyEmail(String token) {
        Customer customer = customerRepository.findByVerificationToken(token)
                .orElseThrow(() -> new NotFoundException("Invalid or expired verification link."));

        if (customer.getVerificationTokenExpiresAt() == null
                || customer.getVerificationTokenExpiresAt().isBefore(Instant.now())) {
            throw new NotFoundException("This verification link has expired. Please request a new one.");
        }

        customer.setEmailVerified(true);
        customer.setVerificationToken(null);
        customer.setVerificationTokenExpiresAt(null);
        customerRepository.save(customer);
    }

    public CustomerAuthResponse login(CustomerLoginRequest request) {
        Customer customer = customerRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), customer.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }
        if (!customer.isEmailVerified()) {
            throw new EmailNotVerifiedException("Please verify your email before logging in.");
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
