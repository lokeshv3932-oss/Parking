package com.symmesfleet.backend.web;

import com.symmesfleet.backend.service.CustomerService;
import com.symmesfleet.backend.web.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
public class CustomerAuthController {

    private final CustomerService customerService;

    public CustomerAuthController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse signup(@Valid @RequestBody CustomerSignupRequest request) {
        customerService.signup(request);
        return new MessageResponse("Account created. Check your email to verify your address before logging in.");
    }

    @PostMapping("/resend-verification")
    public MessageResponse resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        customerService.resendVerification(request.email());
        return new MessageResponse("If an unverified account exists for this email, a new verification link has been sent.");
    }

    @GetMapping("/verify-email")
    public MessageResponse verifyEmail(@RequestParam String token) {
        customerService.verifyEmail(token);
        return new MessageResponse("Email verified. You can now log in.");
    }

    @PostMapping("/login")
    public CustomerAuthResponse login(@Valid @RequestBody CustomerLoginRequest request) {
        return customerService.login(request);
    }
}
