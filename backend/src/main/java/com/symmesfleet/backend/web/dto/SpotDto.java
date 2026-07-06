package com.symmesfleet.backend.web.dto;

import com.symmesfleet.backend.domain.ParkingSpot;
import com.symmesfleet.backend.domain.SpotType;

public record SpotDto(
        Long id,
        String spotNumber,
        SpotType spotType,
        Integer monthlyRateCents,
        Integer dailyRateCents,
        boolean active
) {
    public static SpotDto from(ParkingSpot spot) {
        return new SpotDto(
                spot.getId(),
                spot.getSpotNumber(),
                spot.getSpotType(),
                spot.getMonthlyRateCents(),
                spot.getDailyRateCents(),
                spot.isActive()
        );
    }
}
