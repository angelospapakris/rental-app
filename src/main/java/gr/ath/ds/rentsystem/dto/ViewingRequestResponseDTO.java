package gr.ath.ds.rentsystem.dto;

import gr.ath.ds.rentsystem.util.enums.ViewingStatus;
import lombok.Data;

import java.time.LocalDateTime;

// For read-only
@Data
public class ViewingRequestResponseDTO {
    private Long id;
    private LocalDateTime requestedAt;
    private ViewingStatus status;
    private String notes;
    private Long tenantId;
    private Long propertyId;
}
