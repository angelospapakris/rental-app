package gr.ath.ds.rentsystem.rest;

import gr.ath.ds.rentsystem.dto.ViewingRequestCreateRequestDTO;
import gr.ath.ds.rentsystem.dto.ViewingRequestResponseDTO;
import gr.ath.ds.rentsystem.mapper.ViewingRequestMapper;
import gr.ath.ds.rentsystem.model.ViewingRequest;
import gr.ath.ds.rentsystem.service.IViewingRequestService;
import gr.ath.ds.rentsystem.service.UserServiceImpl;
import gr.ath.ds.rentsystem.util.enums.ViewingStatus;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectAlreadyExists;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectInvalidArgumentException;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectNotAuthorizedException;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/viewings")
@RequiredArgsConstructor
@Tag(name = "Viewing Requests")
public class ViewingRequestController {

    private final IViewingRequestService vrService;
    private final ViewingRequestMapper vrMapper;
    private final UserServiceImpl userService;

    // -------- Tenant: request viewing --------
    @PostMapping
    @PreAuthorize("hasRole('TENANT')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Tenant requests a property viewing",
            description = "Creates a new viewing request for the given property.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Viewing request submitted",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ViewingRequestResponseDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized"),
                    @ApiResponse(responseCode = "403", description = "Forbidden"),
                    @ApiResponse(responseCode = "409", description = "Property not available / business rule violation")
            }
    )
    public ResponseEntity<ViewingRequestResponseDTO> request(
            Authentication auth,
            @RequestParam("propertyId") Long propertyId,
            @Valid @RequestBody ViewingRequestCreateRequestDTO dto) throws AppObjectInvalidArgumentException, AppObjectNotFoundException, AppObjectAlreadyExists {

        Long tenantId = userService.getByEmail(auth.getName()).orElseThrow().getId();
        ViewingRequest saved = vrService.request(tenantId, propertyId, dto.getNotes());
        return ResponseEntity.ok(vrMapper.toResponseDTO(saved));
    }

    // -------- Tenant: my viewing requests --------
    @GetMapping("/my")
    @PreAuthorize("hasRole('TENANT')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Tenant dashboard: list my viewing requests",
            description = "Returns a paginated list of viewing requests for the authenticated tenant.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Page of viewing requests",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ViewingRequestResponseDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized"),
                    @ApiResponse(responseCode = "403", description = "Forbidden")
            }
    )
    public ResponseEntity<Paginated<ViewingRequestResponseDTO>> myViewings(
            Authentication auth,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(value = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @ParameterObject Pageable pageable) {

        Long tenantId = userService.getByEmail(auth.getName()).orElseThrow().getId();
        ViewingStatus st = (status == null || status.isBlank())
                ? null : ViewingStatus.valueOf(status.toUpperCase());

        Page<ViewingRequest> page = vrService.listForTenant(tenantId, st, from, to, pageable);
        Page<ViewingRequestResponseDTO> dtoPage = page.map(vrMapper::toResponseDTO);
        return ResponseEntity.ok(new Paginated<>(dtoPage));
    }

    // -------- Owner: viewing requests for my properties --------
    @GetMapping("/owner")
    @PreAuthorize("hasRole('OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Owner dashboard: viewing requests for my properties",
            description = "Returns a paginated list of viewing requests for the authenticated owner’s properties.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Page of viewing requests",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ViewingRequestResponseDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized"),
                    @ApiResponse(responseCode = "403", description = "Forbidden")
            }
    )
    public ResponseEntity<Paginated<ViewingRequestResponseDTO>> forOwner(
            Authentication auth,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(value = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @ParameterObject Pageable pageable) {

        Long ownerId = userService.getByEmail(auth.getName()).orElseThrow().getId();
        ViewingStatus st = (status == null || status.isBlank())
                ? null : ViewingStatus.valueOf(status.toUpperCase());

        Page<ViewingRequest> page = vrService.listForOwner(ownerId, st, from, to, pageable);
        Page<ViewingRequestResponseDTO> dtoPage = page.map(vrMapper::toResponseDTO);
        return ResponseEntity.ok(new Paginated<>(dtoPage));
    }

    // -------- Owner: confirm / decline / complete --------
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Owner confirms a viewing request")
    public ResponseEntity<Void> confirm(Authentication auth, @PathVariable Long id) throws AppObjectNotFoundException, AppObjectAlreadyExists, AppObjectNotAuthorizedException {
        Long ownerId = userService.getByEmail(auth.getName()).orElseThrow().getId();
        vrService.confirm(ownerId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/decline")
    @PreAuthorize("hasRole('OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Owner declines a viewing request")
    public ResponseEntity<Void> decline(Authentication auth, @PathVariable Long id) throws AppObjectNotFoundException, AppObjectAlreadyExists, AppObjectNotAuthorizedException {
        Long ownerId = userService.getByEmail(auth.getName()).orElseThrow().getId();
        vrService.decline(ownerId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Owner marks a viewing as completed")
    public ResponseEntity<Void> complete(Authentication auth, @PathVariable Long id) throws AppObjectNotFoundException, AppObjectAlreadyExists, AppObjectNotAuthorizedException {
        Long ownerId = userService.getByEmail(auth.getName()).orElseThrow().getId();
        vrService.complete(ownerId, id);
        return ResponseEntity.noContent().build();
    }
}
