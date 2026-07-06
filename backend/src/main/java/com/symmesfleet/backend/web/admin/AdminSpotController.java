package com.symmesfleet.backend.web.admin;

import com.symmesfleet.backend.service.SpotService;
import com.symmesfleet.backend.web.dto.SpotDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/spots")
public class AdminSpotController {

    private final SpotService spotService;

    public AdminSpotController(SpotService spotService) {
        this.spotService = spotService;
    }

    @GetMapping
    public List<SpotDto> list() {
        return spotService.findAll();
    }

    @PatchMapping("/{id}")
    public SpotDto setActive(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean active = Boolean.TRUE.equals(body.get("active"));
        return spotService.setActive(id, active);
    }
}
