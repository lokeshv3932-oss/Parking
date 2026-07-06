package com.symmesfleet.backend.service;

import com.symmesfleet.backend.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class BookingExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(BookingExpiryScheduler.class);

    private final BookingRepository bookingRepository;

    public BookingExpiryScheduler(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Scheduled(fixedRate = 60_000)
    public void expireStaleHolds() {
        int expired = bookingRepository.expireStaleHolds(Instant.now());
        if (expired > 0) {
            log.info("Expired {} stale PENDING_PAYMENT booking hold(s)", expired);
        }
    }
}
