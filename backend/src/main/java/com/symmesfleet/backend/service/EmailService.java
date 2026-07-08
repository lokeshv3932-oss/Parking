package com.symmesfleet.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final URI RESEND_ENDPOINT = URI.create("https://api.resend.com/emails");

    private final String apiKey;
    private final String fromEmail;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public EmailService(
            @Value("${app.resend.api-key}") String apiKey,
            @Value("${app.resend.from-email}") String fromEmail
    ) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
    }

    public void sendVerificationEmail(String toEmail, String verificationUrl) {
        String subject = "Verify your Symmes Fleet account";
        String html = """
                <p>Thanks for signing up with Symmes Fleet Parking &amp; Repair.</p>
                <p><a href="%s">Click here to verify your email address</a></p>
                <p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
                """.formatted(verificationUrl);

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("RESEND_API_KEY not configured - email not sent to {}. Verification URL: {}", toEmail, verificationUrl);
            return;
        }
        send(toEmail, subject, html);
    }

    private void send(String toEmail, String subject, String html) {
        try {
            Map<String, Object> body = Map.of(
                    "from", fromEmail,
                    "to", new String[] { toEmail },
                    "subject", subject,
                    "html", html
            );
            String json = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(RESEND_ENDPOINT)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                log.error("Resend API returned status {} sending to {}: {}", response.statusCode(), toEmail, response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send email to {}", toEmail, e);
        }
    }
}
