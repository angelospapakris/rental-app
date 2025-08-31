package gr.ath.ds.rentsystem.rest;

import gr.ath.ds.rentsystem.dto.PropertyCreateRequestDTO;
import gr.ath.ds.rentsystem.dto.PropertyResponseDTO;
import gr.ath.ds.rentsystem.mapper.PropertyMapper;
import gr.ath.ds.rentsystem.model.Property;
import gr.ath.ds.rentsystem.service.PropertyServiceImpl;
import gr.ath.ds.rentsystem.service.UserServiceImpl;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectAlreadyExists;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectNotFoundException;
import gr.ath.ds.rentsystem.util.filters.Paginated;
import gr.ath.ds.rentsystem.util.filters.PropertyFilters;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@Tag(name = "Properties")
public class PropertyController {

    private final PropertyServiceImpl propertyService;
    private final PropertyMapper propertyMapper;
    private final UserServiceImpl userServiceImpl;

    // -------- Public search --------
    @GetMapping
    @Operation(
            summary = "Public property search (approved only)",
            description = "Returns approved property listings. Supports filters by city, type, price, size, etc.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Page of properties",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = PropertyResponseDTO.class)))
            }
    )
    public ResponseEntity<Paginated<PropertyResponseDTO>> search(
            @Parameter(hidden = true) @ModelAttribute PropertyFilters filters) {

        var page = propertyService.searchPublic(
                filters.getCity(),
                filters.getType(),
                filters.getMinPrice(),
                filters.getMaxPrice(),
                filters.getMinBedrooms(),
                filters.getMinBathrooms(),
                filters.getMinSize(),
                filters.getPageable()
        ).map(propertyMapper::toResponseDTO);

        return ResponseEntity.ok(new Paginated<>(page));
    }

    // -------- Owner: create --------
    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Owner creates a new listing (enters PENDING state)",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Listing created",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = PropertyResponseDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content)
            }
    )
    public ResponseEntity<PropertyResponseDTO> create(
            Authentication auth,
            @Valid @RequestBody PropertyCreateRequestDTO dto) {

        Long ownerId = userServiceImpl.getByEmail(auth.getName()).orElseThrow().getId();

        Property entity = propertyMapper.toEntity(dto);
        Property created = propertyService.create(ownerId, entity);
        return ResponseEntity.ok(propertyMapper.toResponseDTO(created));
    }

    // -------- Owner: update --------
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Owner updates own listing",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Listing updated",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = PropertyResponseDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
                    @ApiResponse(responseCode = "404", description = "Property not found", content = @Content)
            }
    )
    public ResponseEntity<PropertyResponseDTO> update(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody PropertyCreateRequestDTO dto) {

        Long ownerId = userServiceImpl.getByEmail(auth.getName()).orElseThrow().getId();

        Property entity = propertyMapper.toEntity(dto);
        Property updated = propertyService.update(ownerId, id, entity);
        return ResponseEntity.ok(propertyMapper.toResponseDTO(updated));
    }

    // -------- Owner: my properties --------
    @GetMapping("/my")
    @PreAuthorize("hasRole('OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Owner dashboard: list my properties",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Page of properties",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = PropertyResponseDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content)
            }
    )
    public ResponseEntity<Paginated<PropertyResponseDTO>> listMine(
            Authentication auth,
            @Parameter(hidden = true) @ModelAttribute PropertyFilters filters) {

        Long ownerId = userServiceImpl.getByEmail(auth.getName()).orElseThrow().getId();

        var page = propertyService
                .listForOwner(ownerId, filters.getPageable())
                .map(propertyMapper::toResponseDTO);

        return ResponseEntity.ok(new Paginated<>(page));
    }

    // -------- Admin: pending --------
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Admin: list pending listings",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Page of pending properties",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = PropertyResponseDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content)
            }
    )
    public ResponseEntity<Paginated<PropertyResponseDTO>> listPending(
            Authentication auth,
            @Parameter(hidden = true) @ModelAttribute PropertyFilters filters) {

        Long adminId = userServiceImpl.getByEmail(auth.getName()).orElseThrow().getId();

        var page = propertyService
                .listPendingForAdmin(adminId, filters.getPageable())
                .map(propertyMapper::toResponseDTO);

        return ResponseEntity.ok(new Paginated<>(page));
    }

    // -------- Admin: approve --------
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Admin approves a listing")
    public ResponseEntity<Void> approve(
            Authentication auth,
            @PathVariable Long id) throws AppObjectNotFoundException, AppObjectAlreadyExists {

        Long adminId = userServiceImpl.getByEmail(auth.getName()).orElseThrow().getId();

        propertyService.approve(adminId, id);
        return ResponseEntity.noContent().build();
    }

    // -------- Admin: reject --------
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Admin rejects a listing")
    public ResponseEntity<Void> reject(
            Authentication auth,
            @PathVariable Long id) {

        Long adminId = userServiceImpl.getByEmail(auth.getName()).orElseThrow().getId();

        propertyService.reject(adminId, id);
        return ResponseEntity.noContent().build();
    }
}
