package gr.ath.ds.rentsystem.dto;

import gr.ath.ds.rentsystem.util.enums.RoleType;
import lombok.Data;

import java.util.Set;

// For read-only
@Data
public class UserResponseDTO {
    private Long id;
    private String email;
    private String username;
    private String firstname;
    private String lastname;
    private String phone;
    private boolean active;
    private boolean verified;
    private Set<RoleType> roles;
}

