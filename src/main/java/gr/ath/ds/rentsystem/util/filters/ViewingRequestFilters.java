package gr.ath.ds.rentsystem.util.filters;

import gr.ath.ds.rentsystem.model.ViewingRequest;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.Specification;

@Getter
@Setter
public class ViewingRequestFilters extends GenericFilters {
    private Long tenantId;
    private Long ownerId;
    private gr.ath.ds.rentsystem.util.enums.ViewingStatus status;
    private java.time.LocalDateTime requestedFrom;
    private java.time.LocalDateTime requestedTo;

    public Specification<ViewingRequest> toSpec() {
        return Specification.allOf(
                tenantId != null ? gr.ath.ds.rentsystem.util.specifications.ViewingRequestSpecifications.byTenant(tenantId) : null,
                ownerId  != null ? gr.ath.ds.rentsystem.util.specifications.ViewingRequestSpecifications.byOwner(ownerId)   : null,
                gr.ath.ds.rentsystem.util.specifications.ViewingRequestSpecifications.byStatus(status),
                gr.ath.ds.rentsystem.util.specifications.ViewingRequestSpecifications.requestedBetween(requestedFrom, requestedTo)
        );
    }
}

