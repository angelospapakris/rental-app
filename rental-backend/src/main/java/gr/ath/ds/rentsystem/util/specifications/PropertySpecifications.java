package gr.ath.ds.rentsystem.util.specifications;

import gr.ath.ds.rentsystem.model.Property;
import gr.ath.ds.rentsystem.util.enums.PropertyStatus;
import gr.ath.ds.rentsystem.util.enums.PropertyType;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class PropertySpecifications {

    public static Specification<Property> hasStatus(PropertyStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<Property> hasCity(String city) {
        return (root, q, cb) -> (city == null || city.isBlank())
                ? cb.conjunction()
                : cb.equal(cb.lower(root.get("city")), city.toLowerCase());
    }

    public static Specification<Property> hasType(String type) {
        return (root, q, cb) -> {
            if (type == null || type.isBlank()) return cb.conjunction();
            try {
                return cb.equal(root.get("type"), PropertyType.valueOf(type.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return cb.disjunction();
            }
        };
    }

    public static Specification<Property> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, q, cb) -> {
            if (min != null && max != null) return cb.between(root.get("price"), min, max);
            if (min != null) return cb.greaterThanOrEqualTo(root.get("price"), min);
            if (max != null) return cb.lessThanOrEqualTo(root.get("price"), max);
            return cb.conjunction();
        };
    }

    public static Specification<Property> minBedrooms(Integer min) {
        return (root, q, cb) -> min == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get("bedrooms"), min);
    }

    public static Specification<Property> minBathrooms(Integer min) {
        return (root, q, cb) -> min == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get("bathrooms"), min);
    }

    public static Specification<Property> minSize(Integer min) {
        return (root, q, cb) -> min == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get("size"), min);
    }

    public static Specification<Property> ownerId(Long ownerId) {
        return (root, q, cb) -> ownerId == null ? cb.conjunction() : cb.equal(root.get("owner").get("id"), ownerId);
    }
}
