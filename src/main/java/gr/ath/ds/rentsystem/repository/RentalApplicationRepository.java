package gr.ath.ds.rentsystem.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import gr.ath.ds.rentsystem.util.enums.ApplicationStatus;

import gr.ath.ds.rentsystem.model.RentalApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RentalApplicationRepository extends JpaRepository<RentalApplication, Long>, JpaSpecificationExecutor<RentalApplication> {
    boolean existsByTenant_IdAndProperty_Id(Long tenantId, Long propertyId);

    Page<RentalApplication> findByTenantId(Long tenantId, Pageable pageable);

    Page<RentalApplication> findByTenantIdAndStatus(Long tenantId, ApplicationStatus status, Pageable pageable);

    Page<RentalApplication> findByTenantIdAndPropertyId(Long tenantId, Long propertyId, Pageable pageable);

    Page<RentalApplication> findByTenantIdAndPropertyIdAndStatus(Long tenantId, Long propertyId, ApplicationStatus status, Pageable pageable);

    Page<RentalApplication> findAllByProperty_Owner_Id(Long ownerId, Pageable pageable);

    Page<RentalApplication> findAllByProperty_Owner_IdAndProperty_Id(Long ownerId, Long propertyId, Pageable pageable);
}

