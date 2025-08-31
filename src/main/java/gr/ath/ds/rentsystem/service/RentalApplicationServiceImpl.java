package gr.ath.ds.rentsystem.service;

import gr.ath.ds.rentsystem.dto.RentalApplicationResponseDTO;
import gr.ath.ds.rentsystem.mapper.RentalApplicationMapper;
import gr.ath.ds.rentsystem.model.Property;
import gr.ath.ds.rentsystem.model.RentalApplication;
import gr.ath.ds.rentsystem.model.User;
import gr.ath.ds.rentsystem.repository.PropertyRepository;
import gr.ath.ds.rentsystem.repository.RentalApplicationRepository;
import gr.ath.ds.rentsystem.repository.UserRepository;
import gr.ath.ds.rentsystem.service.IRentalApplicationService;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectAlreadyExists;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectInvalidArgumentException;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectNotFoundException;
import gr.ath.ds.rentsystem.util.filters.Paginated;
import gr.ath.ds.rentsystem.util.filters.RentalApplicationFilters;
import gr.ath.ds.rentsystem.util.specifications.RentalApplicationSpecifications;
import gr.ath.ds.rentsystem.util.enums.ApplicationStatus;
import gr.ath.ds.rentsystem.util.enums.PropertyStatus;
import gr.ath.ds.rentsystem.util.enums.RoleType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RentalApplicationServiceImpl implements IRentalApplicationService {

    private final RentalApplicationRepository appRepo;
    private final PropertyRepository propertyRepo;
    private final UserRepository userRepo;
    private final RentalApplicationMapper appMapper;

    private void mustHave(Long uid, RoleType rt) {
        if (!userRepo.hasRole(uid, rt)) throw new SecurityException("Forbidden: " + rt + " required");
    }

    @Override @Transactional
    public RentalApplication submit(Long tenantId, Long propertyId, String message) throws AppObjectAlreadyExists, AppObjectInvalidArgumentException, AppObjectNotFoundException {
        mustHave(tenantId, RoleType.TENANT);
        User tenant = userRepo.findById(tenantId).orElseThrow();
        if (!Boolean.TRUE.equals(tenant.getIsVerified()))
            throw new SecurityException("Tenant must be verified");

        Property p = propertyRepo.findById(propertyId)
                .orElseThrow(() -> new AppObjectNotFoundException("NotFound","Property not found"));

        if (p.getStatus() != PropertyStatus.APPROVED) {
            throw new AppObjectInvalidArgumentException("InvalidArgument","Property not available");
        }

        if (appRepo.existsByTenant_IdAndProperty_Id(tenantId, propertyId)) {
            throw new AppObjectAlreadyExists("AlreadyExists","Application already exists for this property");
        }

        RentalApplication ra = new RentalApplication();
        ra.setTenant(tenant);
        ra.setProperty(p);
        ra.setMessage(message);
        ra.setStatus(ApplicationStatus.PENDING);
        return appRepo.save(ra);
    }

    @Override @Transactional
    public RentalApplication approve(Long ownerId, Long applicationId) {
        mustHave(ownerId, RoleType.OWNER);
        RentalApplication ra = appRepo.findById(applicationId).orElseThrow();
        if (!ra.getProperty().getOwner().getId().equals(ownerId))
            throw new SecurityException("Forbidden: not your property");
        ra.setStatus(ApplicationStatus.APPROVED);
        return appRepo.save(ra);
    }

    @Override @Transactional
    public RentalApplication reject(Long ownerId, Long applicationId) {
        mustHave(ownerId, RoleType.OWNER);
        RentalApplication ra = appRepo.findById(applicationId).orElseThrow();
        if (!ra.getProperty().getOwner().getId().equals(ownerId))
            throw new SecurityException("Forbidden: not your property");
        ra.setStatus(ApplicationStatus.REJECTED);
        return appRepo.save(ra);
    }

    @Override
    public Page<RentalApplication> listForTenant(Long tenantId, Long propertyId,
                                                 ApplicationStatus status, Pageable pageable) {
        if (propertyId == null && status == null) {
            return appRepo.findByTenantId(tenantId, pageable);
        }
        if (propertyId == null) {
            return appRepo.findByTenantIdAndStatus(tenantId, status, pageable);
        }
        if (status == null) {
            return appRepo.findByTenantIdAndPropertyId(tenantId, propertyId, pageable);
        }
        return appRepo.findByTenantIdAndPropertyIdAndStatus(tenantId, propertyId, status, pageable);
    }


    @Override
    @Transactional(readOnly = true)
    public Page<RentalApplication> listForOwner(Long ownerId, Long propertyId, Pageable pageable) {
        if (propertyId == null) {
            return appRepo.findAllByProperty_Owner_Id(ownerId, pageable);
        }
        return appRepo.findAllByProperty_Owner_IdAndProperty_Id(ownerId, propertyId, pageable);
    }

    @Override
    public Page<RentalApplication> search(RentalApplicationFilters filters) {
        return appRepo.findAll(filters.toSpec(), filters.getPageable());
    }

    @Override
    public Paginated<RentalApplicationResponseDTO> searchDto(RentalApplicationFilters filters) {
        Page<RentalApplication> page = search(filters);
        Page<RentalApplicationResponseDTO> dtoPage = page.map(appMapper::toResponseDTO);
        return new Paginated<>(dtoPage);
    }
}

