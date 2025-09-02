package gr.ath.ds.rentsystem.dto;

import gr.ath.ds.rentsystem.util.enums.RoleType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// For insert
@Data
public class RegisterRequestDTO {
    @Email @NotBlank private String email;
    @NotBlank private String username;
    @NotBlank private String password;
    @NotBlank private String firstname;
    @NotBlank private String lastname;
    private String phone;
    private RoleType role;
}

