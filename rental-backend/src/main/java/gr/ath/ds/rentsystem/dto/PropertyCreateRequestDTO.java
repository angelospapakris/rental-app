package gr.ath.ds.rentsystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

// For insert
@Data
public class PropertyCreateRequestDTO {
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 100, message = "Title must be 5–100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must be up to 2000 characters")
    private String description;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 255, message = "Address must be 5–255 characters")
    private String address;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 100, message = "City must be 2–100 characters")
    private String city;

    @NotNull
    @Min(value = 0, message = "Bedrooms must be >= 0")
    private int bedrooms;

    @NotNull
    @Min(value = 0, message = "Bathrooms must be >= 0")
    private int bathrooms;

    @NotNull
    @Min(value = 1, message = "Size must be >= 1")
    private int size;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be > 0")
    @Digits(integer = 10, fraction = 2, message = "Price format not valid")
    private BigDecimal price;

    @NotBlank(message = "Property type is required")
    @Pattern(
            regexp = "^(APARTMENT|HOUSE|STUDIO)$",
            message = "Type must be one of: APARTMENT, HOUSE, STUDIO"
    )
    private String type;
}

