package gr.ath.ds.rentsystem.rest;

import gr.ath.ds.rentsystem.dto.UserResponseDTO;
import gr.ath.ds.rentsystem.mapper.UserMapper;
import gr.ath.ds.rentsystem.model.User;
import gr.ath.ds.rentsystem.service.IUserService;
import gr.ath.ds.rentsystem.util.enums.RoleType;
import gr.ath.ds.rentsystem.util.filters.Paginated;
import gr.ath.ds.rentsystem.util.filters.UserFilters;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users (Admin)")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final IUserService userService;
    private final UserMapper userMapper;

    // -------- Search users (paginated + filters) --------
    @GetMapping
    @Operation(
            summary = "Admin: search users",
            description = "Returns a paginated list of users filtered by the supplied query parameters.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Page of users",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = UserResponseDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content)
            }
    )
    public ResponseEntity<Paginated<UserResponseDTO>> search(
            @Parameter(hidden = true) @ModelAttribute UserFilters filters) {

        return ResponseEntity.ok(userService.searchDto(filters));
    }

    // -------- Get user by id (read-only) --------
    @GetMapping("/{id}")
    @Operation(
            summary = "Admin: get user by id",
            description = "Returns the user details for the given id.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "User found",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = UserResponseDTO.class))),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
                    @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
            }
    )
    public ResponseEntity<UserResponseDTO> getById(@PathVariable Long id) {
        User u = userService.getById(id).orElseThrow();
        return ResponseEntity.ok(userMapper.toResponseDTO(u));
    }

    // -------- Activate / Deactivate --------
    @PostMapping("/{id}/activate")
    @Operation(
            summary = "Admin: activate user",
            description = "Activates a user account.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Activated"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
                    @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
            }
    )
    public ResponseEntity<Void> activate(Authentication auth, @PathVariable Long id) {
        Long adminId = userService.getByEmail(auth.getName()).orElseThrow().getId();
        userService.activate(adminId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/deactivate")
    @Operation(
            summary = "Admin: deactivate user",
            description = "Deactivates a user account.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Deactivated"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
                    @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
            }
    )
    public ResponseEntity<Void> deactivate(Authentication auth, @PathVariable Long id) {
        Long adminId = userService.getByEmail(auth.getName()).orElseThrow().getId();
        userService.deactivate(adminId, id);
        return ResponseEntity.noContent().build();
    }

    // -------- Verify tenant (KYC) --------
    @PostMapping("/{id}/verify")
    @Operation(
            summary = "Admin: verify tenant user (KYC)",
            description = "Marks a TENANT user as verified.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Verified"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
                    @ApiResponse(responseCode = "404", description = "User not found", content = @Content),
                    @ApiResponse(responseCode = "409", description = "User is not TENANT", content = @Content)
            }
    )
    public ResponseEntity<Void> verifyTenant(Authentication auth, @PathVariable Long id) {
        Long adminId = userService.getByEmail(auth.getName()).orElseThrow().getId();
        userService.verifyTenant(adminId, id);
        return ResponseEntity.noContent().build();
    }

    // -------- Assign / Remove role --------
    @PostMapping("/{id}/roles/{role}")
    @Operation(
            summary = "Admin: assign role to user",
            description = "Assigns a role to the user. Allowed values for role are the enum names (e.g., TENANT, OWNER, ADMIN).",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Role assigned"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
                    @ApiResponse(responseCode = "404", description = "User/Role not found", content = @Content)
            }
    )
    public ResponseEntity<Void> assignRole(Authentication auth,
                                           @PathVariable Long id,
                                           @PathVariable String role) {
        Long adminId = userService.getByEmail(auth.getName()).orElseThrow().getId();
        userService.assignRole(adminId, id, RoleType.valueOf(role.toUpperCase()));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/roles/{role}")
    @Operation(
            summary = "Admin: remove role from user",
            description = "Removes a role from the user.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Role removed"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
                    @ApiResponse(responseCode = "404", description = "User/Role not found", content = @Content)
            }
    )
    public ResponseEntity<Void> removeRole(Authentication auth,
                                           @PathVariable Long id,
                                           @PathVariable String role) {
        Long adminId = userService.getByEmail(auth.getName()).orElseThrow().getId();
        userService.removeRole(adminId, id, RoleType.valueOf(role.toUpperCase()));
        return ResponseEntity.noContent().build();
    }
}
