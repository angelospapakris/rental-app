package gr.ath.ds.rentsystem.util.specifications;

import gr.ath.ds.rentsystem.model.ViewingRequest;
import gr.ath.ds.rentsystem.util.enums.ViewingStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class ViewingRequestSpecifications {

    public static Specification<ViewingRequest> byTenant(Long tenantId) {
        return (root, q, cb) -> cb.equal(root.get("tenant").get("id"), tenantId);
    }

    public static Specification<ViewingRequest> byOwner(Long ownerId) {
        return (root, q, cb) -> cb.equal(root.get("property").get("owner").get("id"), ownerId);
    }

    public static Specification<ViewingRequest> byStatus(ViewingStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<ViewingRequest> requestedBetween(LocalDateTime from, LocalDateTime to) {
        return (root, q, cb) -> {
            if (from != null && to != null) return cb.between(root.get("requestedAt"), from, to);
            if (from != null) return cb.greaterThanOrEqualTo(root.get("requestedAt"), from);
            if (to != null) return cb.lessThanOrEqualTo(root.get("requestedAt"), to);
            return cb.conjunction();
        };
    }
}

