package com.symmesfleet.backend.web;

import com.symmesfleet.backend.service.MechanicRequestService;
import com.symmesfleet.backend.web.dto.MechanicRequestCreateRequest;
import com.symmesfleet.backend.web.dto.MechanicRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mechanic-requests")
public class MechanicRequestController {

    private final MechanicRequestService mechanicRequestService;

    public MechanicRequestController(MechanicRequestService mechanicRequestService) {
        this.mechanicRequestService = mechanicRequestService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MechanicRequestDto create(@Valid @RequestBody MechanicRequestCreateRequest request) {
        return mechanicRequestService.create(request);
    }
}
