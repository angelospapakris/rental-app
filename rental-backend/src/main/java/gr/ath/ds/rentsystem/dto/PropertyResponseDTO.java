package gr.ath.ds.rentsystem.dto;

import gr.ath.ds.rentsystem.util.enums.PropertyStatus;
import gr.ath.ds.rentsystem.util.enums.PropertyType;
import lombok.Data;

import java.math.BigDecimal;

// For read-only
@Data
public class PropertyResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String address;
    private String city;
    private int bedrooms;
    private int bathrooms;
    private int size;
    private BigDecimal price;
    private PropertyType type;
    private PropertyStatus status;
    private Long ownerId;
}

