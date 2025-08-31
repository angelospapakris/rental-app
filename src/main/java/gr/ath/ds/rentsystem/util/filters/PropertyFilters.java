package gr.ath.ds.rentsystem.util.filters;

import gr.ath.ds.rentsystem.model.Property;
import gr.ath.ds.rentsystem.util.enums.PropertyStatus;
import gr.ath.ds.rentsystem.util.specifications.PropertySpecifications;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

@Getter @Setter
public class PropertyFilters extends GenericFilters {
    private String city;
    private String type;           // APARTMENT/HOUSE/STUDIO
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer minBedrooms;
    private Integer minBathrooms;
    private Integer minSize;
    private PropertyStatus status; // admin view
    private Long ownerId;          // owner dashboard

    public Specification<Property> toSpec() {
        return Specification.allOf(
                (status == null ? PropertySpecifications.hasStatus(PropertyStatus.APPROVED)
                        : PropertySpecifications.hasStatus(status)),
                PropertySpecifications.hasCity(city),
                PropertySpecifications.hasType(type),
                PropertySpecifications.priceBetween(minPrice, maxPrice),
                PropertySpecifications.minBedrooms(minBedrooms),
                PropertySpecifications.minBathrooms(minBathrooms),
                PropertySpecifications.minSize(minSize),
                PropertySpecifications.ownerId(ownerId)
        );
    }
}

