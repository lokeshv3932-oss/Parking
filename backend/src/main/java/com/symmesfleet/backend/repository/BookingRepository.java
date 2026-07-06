package com.symmesfleet.backend.repository;

import com.symmesfleet.backend.domain.Booking;
import com.symmesfleet.backend.domain.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByStripePaymentIntentId(String stripePaymentIntentId);

    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status, Pageable pageable);

    @Query("""
        SELECT COUNT(b) FROM Booking b
        WHERE b.spot.id = :spotId
        AND b.status IN (com.symmesfleet.backend.domain.BookingStatus.PENDING_PAYMENT, com.symmesfleet.backend.domain.BookingStatus.CONFIRMED)
        AND b.startDate < :endDate AND b.endDate > :startDate
        """)
    long countOverlapping(@Param("spotId") Long spotId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    List<Booking> findByStatusAndHoldExpiresAtBefore(BookingStatus status, Instant instant);

    long countByStatus(BookingStatus status);

    @Query("""
        SELECT COUNT(b) FROM Booking b
        WHERE b.status IN :statuses AND b.startDate <= :today AND b.endDate > :today
        """)
    long countActiveOnDate(@Param("statuses") List<BookingStatus> statuses, @Param("today") LocalDate today);

    @Modifying
    @Transactional
    @Query("""
        UPDATE Booking b SET b.status = com.symmesfleet.backend.domain.BookingStatus.CONFIRMED, b.holdExpiresAt = null
        WHERE b.stripePaymentIntentId = :paymentIntentId AND b.status = com.symmesfleet.backend.domain.BookingStatus.PENDING_PAYMENT
        """)
    int confirmIfPending(@Param("paymentIntentId") String paymentIntentId);

    @Modifying
    @Transactional
    @Query("""
        UPDATE Booking b SET b.status = com.symmesfleet.backend.domain.BookingStatus.CANCELLED
        WHERE b.stripePaymentIntentId = :paymentIntentId AND b.status = com.symmesfleet.backend.domain.BookingStatus.PENDING_PAYMENT
        """)
    int cancelIfPendingByPaymentIntent(@Param("paymentIntentId") String paymentIntentId);

    @Modifying
    @Transactional
    @Query("""
        UPDATE Booking b SET b.status = com.symmesfleet.backend.domain.BookingStatus.EXPIRED
        WHERE b.status = com.symmesfleet.backend.domain.BookingStatus.PENDING_PAYMENT AND b.holdExpiresAt < :now
        """)
    int expireStaleHolds(@Param("now") Instant now);
}
