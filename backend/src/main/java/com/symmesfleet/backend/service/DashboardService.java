package com.symmesfleet.backend.service;

import com.symmesfleet.backend.domain.BookingStatus;
import com.symmesfleet.backend.domain.MechanicRequestStatus;
import com.symmesfleet.backend.repository.BookingRepository;
import com.symmesfleet.backend.repository.MechanicRequestRepository;
import com.symmesfleet.backend.repository.ParkingSpotRepository;
import com.symmesfleet.backend.web.dto.DashboardSummary;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final ParkingSpotRepository spotRepository;
    private final BookingRepository bookingRepository;
    private final MechanicRequestRepository mechanicRequestRepository;

    public DashboardService(
            ParkingSpotRepository spotRepository,
            BookingRepository bookingRepository,
            MechanicRequestRepository mechanicRequestRepository
    ) {
        this.spotRepository = spotRepository;
        this.bookingRepository = bookingRepository;
        this.mechanicRequestRepository = mechanicRequestRepository;
    }

    public DashboardSummary summary() {
        long totalSpots = spotRepository.count();
        long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long pendingPaymentBookings = bookingRepository.countByStatus(BookingStatus.PENDING_PAYMENT);
        long occupiedSpots = bookingRepository.countActiveOnDate(
                List.of(BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT), LocalDate.now());
        long pendingMechanicRequests = mechanicRequestRepository.countByStatus(MechanicRequestStatus.PENDING);

        return new DashboardSummary(
                totalSpots,
                occupiedSpots,
                Math.max(0, totalSpots - occupiedSpots),
                confirmedBookings,
                pendingPaymentBookings,
                pendingMechanicRequests
        );
    }
}
