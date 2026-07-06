package com.symmesfleet.backend.repository;

import com.symmesfleet.backend.domain.ParkingSpot;
import com.symmesfleet.backend.domain.SpotType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {

    List<ParkingSpot> findBySpotTypeAndActiveTrueOrderBySpotNumber(SpotType spotType);

    List<ParkingSpot> findAllByOrderBySpotNumber();

    @Query("""
        SELECT s FROM ParkingSpot s
        WHERE s.active = true
        AND (:spotType IS NULL OR s.spotType = :spotType)
        AND s.id NOT IN (
            SELECT b.spot.id FROM Booking b
            WHERE b.status IN (com.symmesfleet.backend.domain.BookingStatus.PENDING_PAYMENT, com.symmesfleet.backend.domain.BookingStatus.CONFIRMED)
            AND b.startDate < :endDate AND b.endDate > :startDate
        )
        ORDER BY s.spotNumber
        """)
    List<ParkingSpot> findAvailableSpots(
            @Param("spotType") SpotType spotType,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
