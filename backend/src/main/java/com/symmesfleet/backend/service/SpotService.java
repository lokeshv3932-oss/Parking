package com.symmesfleet.backend.service;

import com.symmesfleet.backend.domain.ParkingSpot;
import com.symmesfleet.backend.domain.SpotType;
import com.symmesfleet.backend.exception.NotFoundException;
import com.symmesfleet.backend.repository.ParkingSpotRepository;
import com.symmesfleet.backend.web.dto.SpotDto;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class SpotService {

    private final ParkingSpotRepository spotRepository;

    public SpotService(ParkingSpotRepository spotRepository) {
        this.spotRepository = spotRepository;
    }

    public List<SpotDto> findAvailable(SpotType type, LocalDate startDate, LocalDate endDate) {
        if (!startDate.isBefore(endDate)) {
            throw new IllegalArgumentException("endDate must be after startDate");
        }
        return spotRepository.findAvailableSpots(type, startDate, endDate).stream()
                .map(SpotDto::from)
                .toList();
    }

    public List<SpotDto> findAll() {
        return spotRepository.findAllByOrderBySpotNumber().stream()
                .map(SpotDto::from)
                .toList();
    }

    public SpotDto setActive(Long spotId, boolean active) {
        ParkingSpot spot = spotRepository.findById(spotId)
                .orElseThrow(() -> new NotFoundException("Parking spot not found"));
        spot.setActive(active);
        return SpotDto.from(spotRepository.save(spot));
    }
}
