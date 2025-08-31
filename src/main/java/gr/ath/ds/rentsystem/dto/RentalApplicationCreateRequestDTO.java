package gr.ath.ds.rentsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

// For insert
@Data
public class RentalApplicationCreateRequestDTO {
    @NotBlank(message = "Message is required")
    @Size(max = 2000, message = "Message must be up to 2000 characters")
    private String message;
}
