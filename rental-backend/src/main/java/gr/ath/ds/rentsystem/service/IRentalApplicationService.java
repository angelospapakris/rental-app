package gr.ath.ds.rentsystem.service;

import gr.ath.ds.rentsystem.dto.RentalApplicationResponseDTO;
import gr.ath.ds.rentsystem.model.RentalApplication;
import gr.ath.ds.rentsystem.util.enums.ApplicationStatus;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectAlreadyExists;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectInvalidArgumentException;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectNotFoundException;
import gr.ath.ds.rentsystem.util.filters.Paginated;
import gr.ath.ds.rentsystem.util.filters.RentalApplicationFilters;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IRentalApplicationService {
    RentalApplication submit(Long tenantId, Long propertyId, String message) throws AppObjectAlreadyExists, AppObjectInvalidArgumentException, AppObjectNotFoundException; // TENANT verified
    RentalApplication approve(Long ownerId, Long applicationId);              // OWNER of that property
    RentalApplication reject(Long ownerId, Long applicationId);               // OWNER of that property

//  Page<RentalApplication> listForTenant(Long tenantId, ApplicationStatus status, Pageable pageable);
    Page<RentalApplication> listForOwner(Long ownerId, Long propertyId, Pageable pageable);
    Page<RentalApplication> listForTenant(Long tenantId, Long propertyId, ApplicationStatus status, Pageable pageable);

    // Core
    Page<RentalApplication> search(RentalApplicationFilters filters);

    // Convenience
    Paginated<RentalApplicationResponseDTO> searchDto(RentalApplicationFilters filters);
}
