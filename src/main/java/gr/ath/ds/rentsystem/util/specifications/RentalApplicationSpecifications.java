package gr.ath.ds.rentsystem.util.specifications;

import gr.ath.ds.rentsystem.model.RentalApplication;
import gr.ath.ds.rentsystem.util.enums.ApplicationStatus;
import org.springframework.data.jpa.domain.Specification;

public class RentalApplicationSpecifications {

    public static Specification<RentalApplication> byTenant(Long tenantId) {
        return (root, q, cb) -> cb.equal(root.get("tenant").get("id"), tenantId);
    }

    public static Specification<RentalApplication> byOwner(Long ownerId) {
        return (root, q, cb) -> cb.equal(root.get("property").get("owner").get("id"), ownerId);
    }

    public static Specification<RentalApplication> byStatus(ApplicationStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<RentalApplication> byProperty(Long propertyId) {
        return (root, q, cb) -> cb.equal(root.get("property").get("id"), propertyId);
    }
}

