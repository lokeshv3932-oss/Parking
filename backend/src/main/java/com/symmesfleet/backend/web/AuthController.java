package com.symmesfleet.backend.web;

import com.symmesfleet.backend.service.AuthService;
import com.symmesfleet.backend.web.dto.LoginRequest;
import com.symmesfleet.backend.web.dto.LoginResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
