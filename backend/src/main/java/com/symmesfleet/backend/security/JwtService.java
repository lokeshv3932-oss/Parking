package com.symmesfleet.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Component
public class JwtService {

    private final SecretKey key;
    private final long expirationMinutes;
    private final long customerExpirationMinutes;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes,
            @Value("${app.jwt.customer-expiration-minutes}") long customerExpirationMinutes
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
        this.customerExpirationMinutes = customerExpirationMinutes;
    }

    public String generateToken(String username, String role) {
        return generateToken(username, role, expirationMinutes);
    }

    public String generateCustomerToken(String username, String role) {
        return generateToken(username, role, customerExpirationMinutes);
    }

    private String generateToken(String username, String role, long minutes) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(minutes * 60)))
                .signWith(key)
                .compact();
    }

    public long expirationSeconds() {
        return expirationMinutes * 60;
    }

    public long customerExpirationSeconds() {
        return customerExpirationMinutes * 60;
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public List<String> extractRoles(String token) {
        Object role = parseClaims(token).get("role");
        return role == null ? List.of() : List.of(role.toString());
    }

    public boolean isValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
