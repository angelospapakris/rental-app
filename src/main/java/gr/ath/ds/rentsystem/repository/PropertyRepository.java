package gr.ath.ds.rentsystem.repository;

import gr.ath.ds.rentsystem.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {
    boolean existsByIdAndOwner_Id(Long propertyId, Long ownerId);
}
