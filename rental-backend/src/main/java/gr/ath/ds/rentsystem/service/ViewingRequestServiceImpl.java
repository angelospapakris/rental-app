package gr.ath.ds.rentsystem.service;

import gr.ath.ds.rentsystem.dto.ViewingRequestResponseDTO;
import gr.ath.ds.rentsystem.mapper.ViewingRequestMapper;
import gr.ath.ds.rentsystem.model.Property;
import gr.ath.ds.rentsystem.model.User;
import gr.ath.ds.rentsystem.model.ViewingRequest;
import gr.ath.ds.rentsystem.repository.PropertyRepository;
import gr.ath.ds.rentsystem.repository.UserRepository;
import gr.ath.ds.rentsystem.repository.ViewingRequestRepository;
import gr.ath.ds.rentsystem.service.IViewingRequestService;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectAlreadyExists;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectInvalidArgumentException;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectNotAuthorizedException;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectNotFoundException;
import gr.ath.ds.rentsystem.util.filters.Paginated;
import gr.ath.ds.rentsystem.util.filters.ViewingRequestFilters;
import gr.ath.ds.rentsystem.util.specifications.ViewingRequestSpecifications;
import gr.ath.ds.rentsystem.util.enums.PropertyStatus;
import gr.ath.ds.rentsystem.util.enums.RoleType;
import gr.ath.ds.rentsystem.util.enums.ViewingStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ViewingRequestServiceImpl implements IViewingRequestService {

    private final ViewingRequestRepository vrRepo;
    private final PropertyRepository propertyRepo;
    private final UserRepository userRepo;
    private final ViewingRequestMapper vrMapper;

    private void require(Long uid, RoleType rt) {
        if (!userRepo.hasRole(uid, rt)) throw new SecurityException("Forbidden: " + rt + " required");
    }

    @Override
    @Transactional
    public ViewingRequest request(Long tenantId, Long propertyId, String notes) throws AppObjectNotFoundException, AppObjectInvalidArgumentException, AppObjectAlreadyExists {
        require(tenantId, RoleType.TENANT);

        User tenant = userRepo.findById(tenantId)
                .orElseThrow(() -> new AppObjectNotFoundException("NotFound", "Tenant not found"));

        Property p = propertyRepo.findById(propertyId)
                .orElseThrow(() -> new AppObjectNotFoundException("NotFound", "Property not found"));

        if (p.getStatus() != PropertyStatus.APPROVED) {
            throw new AppObjectInvalidArgumentException("InvalidArgument", "Property not available");
        }

        if (vrRepo.existsByTenant_IdAndProperty_Id(tenantId, propertyId)) {
            throw new AppObjectAlreadyExists("AlreadyExists", "Viewing request already exists for this property");
        }

        ViewingRequest vr = new ViewingRequest();
        vr.setTenant(tenant);
        vr.setProperty(p);
        vr.setNotes(notes);
        vr.setStatus(ViewingStatus.REQUESTED);
        return vrRepo.save(vr);
    }

    @Override
    @Transactional
    public ViewingRequest confirm(Long ownerId, Long requestId) throws AppObjectNotFoundException, AppObjectNotAuthorizedException, AppObjectAlreadyExists {
        require(ownerId, RoleType.OWNER);

        ViewingRequest vr = vrRepo.findById(requestId)
                .orElseThrow(() -> new AppObjectNotFoundException("NotFound", "Viewing request not found"));

        if (!vr.getProperty().getOwner().getId().equals(ownerId)) {
            throw new AppObjectNotAuthorizedException("NotAuthorized", "You do not own this property");
        }

        if (vr.getStatus() != ViewingStatus.REQUESTED) {
            throw new AppObjectAlreadyExists("AlreadyExists", "Invalid state transition");
        }

        vr.setStatus(ViewingStatus.CONFIRMED);
        return vrRepo.save(vr);
    }

    @Override
    @Transactional
    public ViewingRequest decline(Long ownerId, Long requestId) throws AppObjectNotAuthorizedException, AppObjectNotFoundException, AppObjectAlreadyExists {
        require(ownerId, RoleType.OWNER);

        ViewingRequest vr = vrRepo.findById(requestId)
                .orElseThrow(() -> new AppObjectNotFoundException("NotFound", "Viewing request not found"));

        if (!vr.getProperty().getOwner().getId().equals(ownerId)) {
            throw new AppObjectNotAuthorizedException("NotAuthorized", "You do not own this property");
        }

        if (vr.getStatus() != ViewingStatus.REQUESTED) {
            throw new AppObjectAlreadyExists("AlreadyExists", "Invalid state transition");
        }

        vr.setStatus(ViewingStatus.DECLINED);
        return vrRepo.save(vr);
    }

    @Override
    @Transactional
    public ViewingRequest complete(Long ownerId, Long requestId) throws AppObjectNotFoundException, AppObjectNotAuthorizedException, AppObjectAlreadyExists {
        require(ownerId, RoleType.OWNER);

        ViewingRequest vr = vrRepo.findById(requestId)
                .orElseThrow(() -> new AppObjectNotFoundException("NotFound", "Viewing request not found"));

        if (!vr.getProperty().getOwner().getId().equals(ownerId)) {
            throw new AppObjectNotAuthorizedException("NotAuthorized", "You do not own this property");
        }

        if (vr.getStatus() != ViewingStatus.CONFIRMED) {
            throw new AppObjectAlreadyExists("AlreadyExists", "Invalid state transition");
        }

        vr.setStatus(ViewingStatus.COMPLETED);
        return vrRepo.save(vr);
    }


    @Override
    @Transactional(readOnly = true)
    public Page<ViewingRequest> listForTenant(Long tenantId,
                                              ViewingStatus status,
                                              LocalDateTime from,
                                              LocalDateTime to,
                                              Pageable pageable) {
        require(tenantId, RoleType.TENANT);

        // No filters
        if (status == null && from == null && to == null) {
            return vrRepo.findByTenant_Id(tenantId, pageable);
        }

        // Only status
        if (from == null && to == null) {
            return vrRepo.findByTenant_IdAndStatus(tenantId, status, pageable);
        }

        // Date filters w/ or w/o status
        if (from != null && to != null) {
            return (status == null)
                    ? vrRepo.findByTenant_IdAndRequestedAtBetween(tenantId, from, to, pageable)
                    : vrRepo.findByTenant_IdAndStatusAndRequestedAtBetween(tenantId, status, from, to, pageable);
        }
        if (from != null) {
            return (status == null)
                    ? vrRepo.findByTenant_IdAndRequestedAtGreaterThanEqual(tenantId, from, pageable)
                    : vrRepo.findByTenant_IdAndStatusAndRequestedAtGreaterThanEqual(tenantId, status, from, pageable);
        }
        // to != null
        return (status == null)
                ? vrRepo.findByTenant_IdAndRequestedAtLessThanEqual(tenantId, to, pageable)
                : vrRepo.findByTenant_IdAndStatusAndRequestedAtLessThanEqual(tenantId, status, to, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ViewingRequest> listForOwner(Long ownerId,
                                             ViewingStatus status,
                                             LocalDateTime from,
                                             LocalDateTime to,
                                             Pageable pageable) {
        require(ownerId, RoleType.OWNER);

        // No filters
        if (status == null && from == null && to == null) {
            return vrRepo.findByProperty_Owner_Id(ownerId, pageable);
        }

        // Only status
        if (from == null && to == null) {
            return vrRepo.findByProperty_Owner_IdAndStatus(ownerId, status, pageable);
        }

        // Date filters w/ or w/o status
        if (from != null && to != null) {
            return (status == null)
                    ? vrRepo.findByProperty_Owner_IdAndRequestedAtBetween(ownerId, from, to, pageable)
                    : vrRepo.findByProperty_Owner_IdAndStatusAndRequestedAtBetween(ownerId, status, from, to, pageable);
        }
        if (from != null) {
            return (status == null)
                    ? vrRepo.findByProperty_Owner_IdAndRequestedAtGreaterThanEqual(ownerId, from, pageable)
                    : vrRepo.findByProperty_Owner_IdAndStatusAndRequestedAtGreaterThanEqual(ownerId, status, from, pageable);
        }
        // to != null
        return (status == null)
                ? vrRepo.findByProperty_Owner_IdAndRequestedAtLessThanEqual(ownerId, to, pageable)
                : vrRepo.findByProperty_Owner_IdAndStatusAndRequestedAtLessThanEqual(ownerId, status, to, pageable);
    }

    @Override
    public Page<ViewingRequest> search(ViewingRequestFilters filters) {
        return null;
    }

    @Override
    public Paginated<ViewingRequestResponseDTO> searchDto(ViewingRequestFilters filters) {
        return null;
    }
}


