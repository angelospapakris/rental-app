package gr.ath.ds.rentsystem.dto;

import gr.ath.ds.rentsystem.util.enums.ApplicationStatus;
import lombok.Data;

// For read-only
@Data
public class RentalApplicationResponseDTO {
    private Long id;
    private String message;
    private ApplicationStatus status;
    private Long tenantId;
    private Long propertyId;
}

