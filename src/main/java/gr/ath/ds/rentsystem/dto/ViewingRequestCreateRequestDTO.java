package gr.ath.ds.rentsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ViewingRequestCreateRequestDTO {
//    @NotNull(message = "Property id is required")
//    private Long propertyId;

    @NotBlank(message = "Notes are required")
    @Size(max = 2000, message = "Notes must be up to 2000 characters")
    private String notes;
}

