package com.symmesfleet.backend.web.dto;

public record LoginResponse(String token, String username, long expiresInSeconds) {
}
