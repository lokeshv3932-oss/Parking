package com.symmesfleet.backend.repository;

import com.symmesfleet.backend.domain.MechanicRequest;
import com.symmesfleet.backend.domain.MechanicRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MechanicRequestRepository extends JpaRepository<MechanicRequest, Long> {

    Page<MechanicRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<MechanicRequest> findByStatusOrderByCreatedAtDesc(MechanicRequestStatus status, Pageable pageable);

    long countByStatus(MechanicRequestStatus status);
}
