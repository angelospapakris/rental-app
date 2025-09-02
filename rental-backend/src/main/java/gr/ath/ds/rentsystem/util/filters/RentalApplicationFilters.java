package gr.ath.ds.rentsystem.util.filters;

import gr.ath.ds.rentsystem.model.RentalApplication;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.Specification;

@Getter
@Setter
public class RentalApplicationFilters extends GenericFilters {
    private Long tenantId;
    private Long ownerId;
    private Long propertyId;
    private gr.ath.ds.rentsystem.util.enums.ApplicationStatus status;

    public Specification<RentalApplication> toSpec() {
        return Specification.allOf(
                tenantId != null ? gr.ath.ds.rentsystem.util.specifications.RentalApplicationSpecifications.byTenant(tenantId) : null,
                ownerId  != null ? gr.ath.ds.rentsystem.util.specifications.RentalApplicationSpecifications.byOwner(ownerId)   : null,
                propertyId != null ? gr.ath.ds.rentsystem.util.specifications.RentalApplicationSpecifications.byProperty(propertyId) : null,
                gr.ath.ds.rentsystem.util.specifications.RentalApplicationSpecifications.byStatus(status)
        );
    }
}

