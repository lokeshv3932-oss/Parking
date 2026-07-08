package com.symmesfleet.backend.service;

import com.symmesfleet.backend.domain.MechanicRequest;
import com.symmesfleet.backend.domain.MechanicRequestStatus;
import com.symmesfleet.backend.exception.NotFoundException;
import com.symmesfleet.backend.repository.MechanicRequestRepository;
import com.symmesfleet.backend.web.dto.MechanicRequestCreateRequest;
import com.symmesfleet.backend.web.dto.MechanicRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class MechanicRequestService {

    private final MechanicRequestRepository repository;
    private final CustomerService customerService;

    public MechanicRequestService(MechanicRequestRepository repository, CustomerService customerService) {
        this.repository = repository;
        this.customerService = customerService;
    }

    public MechanicRequestDto create(MechanicRequestCreateRequest request) {
        MechanicRequest entity = new MechanicRequest();
        customerService.currentCustomer().ifPresent(entity::setCustomer);
        entity.setCustomerName(request.customerName());
        entity.setCustomerEmail(request.customerEmail());
        entity.setCustomerPhone(request.customerPhone());
        entity.setVehicleInfo(request.vehicleInfo());
        entity.setIssueDescription(request.issueDescription());
        entity.setPreferredDate(request.preferredDate());
        entity.setStatus(MechanicRequestStatus.PENDING);
        return MechanicRequestDto.from(repository.save(entity));
    }

    public Page<MechanicRequestDto> list(MechanicRequestStatus status, Pageable pageable) {
        Page<MechanicRequest> page = status != null
                ? repository.findByStatusOrderByCreatedAtDesc(status, pageable)
                : repository.findAllByOrderByCreatedAtDesc(pageable);
        return page.map(MechanicRequestDto::from);
    }

    public MechanicRequestDto updateStatus(Long id, MechanicRequestStatus status) {
        MechanicRequest entity = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Mechanic request not found"));
        entity.setStatus(status);
        return MechanicRequestDto.from(repository.save(entity));
    }
}
