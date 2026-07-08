package com.symmesfleet.backend.web.dto;

public record CustomerAuthResponse(String token, String email, long expiresInSeconds) {
}
