package gr.ath.ds.rentsystem.dto;

import gr.ath.ds.rentsystem.util.enums.RoleType;
import lombok.*;

import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponseDTO {
    private Long userId;
    private String username;
    private String email;
    private String firstname;
    private String lastname;

    private String accessToken;
    private String tokenType;
    private long expiresAt;

    private Set<RoleType> roles;
}

