package gr.ath.ds.rentsystem.rest;

import gr.ath.ds.rentsystem.dto.RentalApplicationCreateRequestDTO;
import gr.ath.ds.rentsystem.dto.RentalApplicationResponseDTO;
import gr.ath.ds.rentsystem.mapper.RentalApplicationMapper;
import gr.ath.ds.rentsystem.model.RentalApplication;
import gr.ath.ds.rentsystem.service.IRentalApplicationService;
import gr.ath.ds.rentsystem.service.UserServiceImpl;
import gr.ath.ds.rentsystem.util.enums.ApplicationStatus;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectAlreadyExists;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectInvalidArgumentException;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectNotFoundException;
import gr.ath.ds.rentsystem.util.filters.Paginated;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Rental Applications")
public class RentalApplicationController {

    private final IRentalApplicationService appService;
    private final RentalApplicationMapper appMapper;
    private final UserServiceImpl userServiceImpl;

    // -------- Tenant: submit application --------
    @PostMapping
    @PreAuthorize("hasRole('TENANT')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Tenant submits a rental application",
            description = "Authenticated tenant submits a rental application for a given property.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Application submitted",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = RentalApplicationResponseDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
                    @ApiResponse(responseCode = "409", description = "Rejected by business rules", content = @Content)
            }
    )
    public ResponseEntity<RentalApplicationResponseDTO> submit(
            Authentication auth,
            @Parameter(description = "ID of the property the tenant is applying for", example = "2")
            @RequestParam("propertyId") Long propertyId,
            @Valid @RequestBody RentalApplicationCreateRequestDTO dto) throws AppObjectInvalidArgumentException, AppObjectNotFoundException, AppObjectAlreadyExists {

        String email = auth.getName();
        Long tenantId = userServiceImpl.getByEmail(email).orElseThrow().getId();

        RentalApplication saved = appService.submit(tenantId, propertyId, dto.getMessage());
        return ResponseEntity.ok(appMapper.toResponseDTO(saved));
    }

    // -------- Tenant: my applications (paginated) --------
    @GetMapping("/my")
    @PreAuthorize("hasRole('TENANT')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Tenant dashboard: list my rental applications",
            description = "Returns all applications submitted by the authenticated tenant. "
                    + "Results can be filtered by propertyId and status.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Page of applications",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = RentalApplicationResponseDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content)
            }
    )
    public ResponseEntity<Paginated<RentalApplicationResponseDTO>> myApplications(
            Authentication auth,
            @Parameter(description = "Optional propertyId filter")
            @RequestParam(value = "propertyId", required = false) Long propertyId,
            @Parameter(description = "Optional application status filter", example = "PENDING")
            @RequestParam(value = "status", required = false) String status,
            @ParameterObject Pageable pageable) {

        String email = auth.getName();
        Long tenantId = userServiceImpl.getByEmail(email).orElseThrow().getId();

        ApplicationStatus st = (status == null || status.isBlank())
                ? null : ApplicationStatus.valueOf(status.toUpperCase());

        Page<RentalApplication> page = appService.listForTenant(tenantId, propertyId, st, pageable);
        Page<RentalApplicationResponseDTO> dtoPage = page.map(appMapper::toResponseDTO);
        return ResponseEntity.ok(new Paginated<>(dtoPage));
    }

    // -------- Owner: applications for my properties (paginated) --------
    @GetMapping("/owner")
    @PreAuthorize("hasRole('OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Owner dashboard: list rental applications for my properties",
            description = "Returns all rental applications for the authenticated Owner's properties. "
                    + "If a propertyId is provided, results will be filtered for that property only.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Page of rental applications",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = RentalApplicationResponseDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content)
            }
    )
    public ResponseEntity<Paginated<RentalApplicationResponseDTO>> forOwner(
            Authentication auth,
            @Parameter(description = "Optional propertyId to filter rental applications for a specific property")
            @RequestParam(value = "propertyId", required = false) Long propertyId,
            @ParameterObject Pageable pageable) {

        String email = auth.getName();
        Long ownerId = userServiceImpl.getByEmail(email).orElseThrow().getId();

        Page<RentalApplication> page = appService.listForOwner(ownerId, propertyId, pageable);
        Page<RentalApplicationResponseDTO> dtoPage = page.map(appMapper::toResponseDTO);
        return ResponseEntity.ok(new Paginated<>(dtoPage));
    }

    // -------- Owner: approve --------
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Owner approves a rental application")
    public ResponseEntity<Void> approve(
            Authentication auth,
            @Parameter(description = "ID of the rental application", example = "5")
            @PathVariable Long id) {

        String email = auth.getName();
        Long ownerId = userServiceImpl.getByEmail(email).orElseThrow().getId();

        appService.approve(ownerId, id);
        return ResponseEntity.noContent().build();
    }

    // -------- Owner: reject --------
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Owner rejects a rental application")
    public ResponseEntity<Void> reject(
            Authentication auth,
            @Parameter(description = "ID of the rental application", example = "5")
            @PathVariable Long id) {

        String email = auth.getName();
        Long ownerId = userServiceImpl.getByEmail(email).orElseThrow().getId();

        appService.reject(ownerId, id);
        return ResponseEntity.noContent().build();
    }
}
