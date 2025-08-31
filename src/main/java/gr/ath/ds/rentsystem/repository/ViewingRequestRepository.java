package gr.ath.ds.rentsystem.repository;

import gr.ath.ds.rentsystem.model.RentalApplication;
import gr.ath.ds.rentsystem.model.ViewingRequest;
import gr.ath.ds.rentsystem.util.enums.ViewingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;

public interface ViewingRequestRepository extends JpaRepository<ViewingRequest, Long>, JpaSpecificationExecutor<RentalApplication> {

    // ---- Tenant queries ----
    Page<ViewingRequest> findByTenant_Id(Long tenantId, Pageable pageable);
    boolean existsByTenant_IdAndProperty_Id(Long tenantId, Long propertyId);
    Page<ViewingRequest> findByTenant_IdAndStatus(Long tenantId, ViewingStatus status, Pageable pageable);

    Page<ViewingRequest> findByTenant_IdAndRequestedAtBetween(Long tenantId, LocalDateTime from, LocalDateTime to, Pageable pageable);
    Page<ViewingRequest> findByTenant_IdAndRequestedAtGreaterThanEqual(Long tenantId, LocalDateTime from, Pageable pageable);
    Page<ViewingRequest> findByTenant_IdAndRequestedAtLessThanEqual(Long tenantId, LocalDateTime to, Pageable pageable);

    Page<ViewingRequest> findByTenant_IdAndStatusAndRequestedAtBetween(Long tenantId, ViewingStatus status, LocalDateTime from, LocalDateTime to, Pageable pageable);
    Page<ViewingRequest> findByTenant_IdAndStatusAndRequestedAtGreaterThanEqual(Long tenantId, ViewingStatus status, LocalDateTime from, Pageable pageable);
    Page<ViewingRequest> findByTenant_IdAndStatusAndRequestedAtLessThanEqual(Long tenantId, ViewingStatus status, LocalDateTime to, Pageable pageable);

    // ---- Owner queries (via property's owner) ----
    Page<ViewingRequest> findByProperty_Owner_Id(Long ownerId, Pageable pageable);
    Page<ViewingRequest> findByProperty_Owner_IdAndStatus(Long ownerId, ViewingStatus status, Pageable pageable);

    Page<ViewingRequest> findByProperty_Owner_IdAndRequestedAtBetween(Long ownerId, LocalDateTime from, LocalDateTime to, Pageable pageable);
    Page<ViewingRequest> findByProperty_Owner_IdAndRequestedAtGreaterThanEqual(Long ownerId, LocalDateTime from, Pageable pageable);
    Page<ViewingRequest> findByProperty_Owner_IdAndRequestedAtLessThanEqual(Long ownerId, LocalDateTime to, Pageable pageable);

    Page<ViewingRequest> findByProperty_Owner_IdAndStatusAndRequestedAtBetween(Long ownerId, ViewingStatus status, LocalDateTime from, LocalDateTime to, Pageable pageable);
    Page<ViewingRequest> findByProperty_Owner_IdAndStatusAndRequestedAtGreaterThanEqual(Long ownerId, ViewingStatus status, LocalDateTime from, Pageable pageable);
    Page<ViewingRequest> findByProperty_Owner_IdAndStatusAndRequestedAtLessThanEqual(Long ownerId, ViewingStatus status, LocalDateTime to, Pageable pageable);
}
