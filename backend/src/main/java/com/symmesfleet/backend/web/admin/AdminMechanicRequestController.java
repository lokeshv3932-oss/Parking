package com.symmesfleet.backend.web.admin;

import com.symmesfleet.backend.domain.MechanicRequestStatus;
import com.symmesfleet.backend.service.MechanicRequestService;
import com.symmesfleet.backend.web.dto.MechanicRequestDto;
import com.symmesfleet.backend.web.dto.StatusUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/mechanic-requests")
public class AdminMechanicRequestController {

    private final MechanicRequestService mechanicRequestService;

    public AdminMechanicRequestController(MechanicRequestService mechanicRequestService) {
        this.mechanicRequestService = mechanicRequestService;
    }

    @GetMapping
    public Page<MechanicRequestDto> list(
            @RequestParam(required = false) MechanicRequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return mechanicRequestService.list(status, pageable);
    }

    @PatchMapping("/{id}")
    public MechanicRequestDto updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        MechanicRequestStatus status = MechanicRequestStatus.valueOf(request.status().toUpperCase());
        return mechanicRequestService.updateStatus(id, status);
    }
}
