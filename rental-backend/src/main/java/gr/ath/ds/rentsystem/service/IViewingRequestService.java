package gr.ath.ds.rentsystem.service;

import gr.ath.ds.rentsystem.model.ViewingRequest;
import gr.ath.ds.rentsystem.util.enums.ViewingStatus;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectAlreadyExists;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectInvalidArgumentException;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectNotAuthorizedException;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectNotFoundException;
import gr.ath.ds.rentsystem.util.filters.Paginated;
import gr.ath.ds.rentsystem.util.filters.ViewingRequestFilters;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface IViewingRequestService {
    ViewingRequest request(Long tenantId, Long propertyId, String notes) throws AppObjectNotFoundException, AppObjectInvalidArgumentException, AppObjectAlreadyExists;   // TENANT
    ViewingRequest confirm(Long ownerId, Long requestId) throws AppObjectNotFoundException, AppObjectNotAuthorizedException, AppObjectAlreadyExists;                   // OWNER of property
    ViewingRequest decline(Long ownerId, Long requestId) throws AppObjectNotAuthorizedException, AppObjectNotFoundException, AppObjectAlreadyExists;                   // OWNER of property
    ViewingRequest complete(Long ownerId, Long requestId) throws AppObjectNotFoundException, AppObjectNotAuthorizedException, AppObjectAlreadyExists;                  // OWNER

    Page<ViewingRequest> listForTenant(Long tenantId, ViewingStatus status, LocalDateTime from, LocalDateTime to, Pageable pageable);
    Page<ViewingRequest> listForOwner(Long ownerId, ViewingStatus status, LocalDateTime from, LocalDateTime to, Pageable pageable);

    // Core
    Page<ViewingRequest> search(ViewingRequestFilters filters);

    // Convenience
    Paginated<gr.ath.ds.rentsystem.dto.ViewingRequestResponseDTO> searchDto(ViewingRequestFilters filters);
}

