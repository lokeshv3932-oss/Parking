package com.symmesfleet.backend.web;

import com.symmesfleet.backend.service.CustomerService;
import com.symmesfleet.backend.web.dto.CustomerAuthResponse;
import com.symmesfleet.backend.web.dto.CustomerLoginRequest;
import com.symmesfleet.backend.web.dto.CustomerSignupRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer")
public class CustomerAuthController {

    private final CustomerService customerService;

    public CustomerAuthController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerAuthResponse signup(@Valid @RequestBody CustomerSignupRequest request) {
        return customerService.signup(request);
    }

    @PostMapping("/login")
    public CustomerAuthResponse login(@Valid @RequestBody CustomerLoginRequest request) {
        return customerService.login(request);
    }
}
