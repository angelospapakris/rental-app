package gr.ath.ds.rentsystem.rest;

import gr.ath.ds.rentsystem.authentication.AuthenticationService;
import gr.ath.ds.rentsystem.dto.AuthenticationRequestDTO;
import gr.ath.ds.rentsystem.dto.AuthenticationResponseDTO;
import gr.ath.ds.rentsystem.dto.RegisterRequestDTO;
import gr.ath.ds.rentsystem.service.UserServiceImpl;
import gr.ath.ds.rentsystem.util.enums.RoleType;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectNotAuthorizedException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth")
public class AuthController {
    private final AuthenticationService authService;
    private final UserServiceImpl userServiceImpl;

    @PostMapping("/login")
    @Operation(summary = "Authenticate with username & password (JWT)")
    public ResponseEntity<AuthenticationResponseDTO> login(@Valid @RequestBody AuthenticationRequestDTO dto) throws AppObjectNotAuthorizedException {
        return ResponseEntity.ok(authService.authenticate(dto));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequestDTO dto) {
        RoleType role = dto.getRole();

        if (role == RoleType.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (role == null) {
            role = RoleType.TENANT;
        }

        userServiceImpl.registerUser(
                dto.getEmail(),
                dto.getUsername(),
                dto.getPassword(),
                dto.getFirstname(),
                dto.getLastname(),
                dto.getPhone(),
                role
        );

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}