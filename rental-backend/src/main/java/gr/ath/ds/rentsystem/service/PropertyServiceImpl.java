package gr.ath.ds.rentsystem.service;

import gr.ath.ds.rentsystem.dto.PropertyResponseDTO;
import gr.ath.ds.rentsystem.mapper.PropertyMapper;
import gr.ath.ds.rentsystem.model.Property;
import gr.ath.ds.rentsystem.repository.PropertyRepository;
import gr.ath.ds.rentsystem.repository.UserRepository;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectAlreadyExists;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectNotFoundException;
import gr.ath.ds.rentsystem.util.filters.Paginated;
import gr.ath.ds.rentsystem.util.filters.PropertyFilters;
import gr.ath.ds.rentsystem.util.specifications.PropertySpecifications;
import gr.ath.ds.rentsystem.util.enums.PropertyStatus;
import gr.ath.ds.rentsystem.util.enums.RoleType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PropertyServiceImpl implements IPropertyService {

    private final PropertyRepository propertyRepo;
    private final UserRepository userRepo;
    private final PropertyMapper propertyMapper;

    private void ensureRole(Long userId, RoleType rt) {
        if (!userRepo.hasRole(userId, rt)) throw new SecurityException("Forbidden: role " + rt + " required");
    }

    @Override @Transactional
    public Property create(Long ownerId, Property dto) {
        ensureRole(ownerId, RoleType.OWNER);
        dto.setId(null);
        dto.setOwner(userRepo.findById(ownerId).orElseThrow());
        dto.setStatus(PropertyStatus.PENDING);
        return propertyRepo.save(dto);
    }

    @Override @Transactional
    public Property update(Long ownerId, Long propertyId, Property dto) {
        ensureRole(ownerId, RoleType.OWNER);
        Property p = propertyRepo.findById(propertyId).orElseThrow();
        if (!p.getOwner().getId().equals(ownerId)) throw new SecurityException("Forbidden: not owner");
        // fields allowed to be updated
        p.setTitle(dto.getTitle()); p.setDescription(dto.getDescription());
        p.setAddress(dto.getAddress()); p.setCity(dto.getCity());
        p.setPrice(dto.getPrice()); p.setBedrooms(dto.getBedrooms()); p.setBathrooms(dto.getBathrooms());
        p.setSize(dto.getSize()); p.setType(dto.getType());
        return propertyRepo.save(p);
    }

    public void resubmit(Long ownerId, Long propertyId) {
        ensureRole(ownerId, RoleType.OWNER);
        Property p = propertyRepo.findById(propertyId).orElseThrow();
        if (!p.getOwner().getId().equals(ownerId)) throw new SecurityException("Forbidden");
        if (p.getStatus() != PropertyStatus.REJECTED) throw new IllegalStateException("Only REJECTED can be resubmitted");
        p.setStatus(PropertyStatus.PENDING);
        propertyRepo.save(p);
    }

    @Override
    @Transactional
    public void approve(Long adminId, Long propertyId) throws AppObjectNotFoundException, AppObjectAlreadyExists {
        ensureRole(adminId, RoleType.ADMIN);
        Property p = propertyRepo.findById(propertyId)
                .orElseThrow(() -> new AppObjectNotFoundException("NotFound","Property not found"));

        if (p.getStatus() != PropertyStatus.PENDING) {
            throw new AppObjectAlreadyExists("AlreadyExists","Property cannot be approved because it is not pending");
        }

        p.setStatus(PropertyStatus.APPROVED);
        propertyRepo.save(p);
    }


    @Override @Transactional
    public void reject(Long adminId, Long propertyId) {
        ensureRole(adminId, RoleType.ADMIN);
        Property p = propertyRepo.findById(propertyId).orElseThrow();
        if (p.getStatus() != PropertyStatus.PENDING) throw new IllegalStateException("Not pending");
        p.setStatus(PropertyStatus.REJECTED);
        propertyRepo.save(p);
    }

    @Override
    public Page<Property> searchPublic(String city, String type, BigDecimal minPrice, BigDecimal maxPrice, Integer minBedrooms, Integer minBathrooms, Integer minSize, Pageable pageable) {
        Specification<Property> spec = Specification.allOf(
                PropertySpecifications.hasStatus(PropertyStatus.APPROVED),
                PropertySpecifications.hasCity(city),
                PropertySpecifications.hasType(type),
                PropertySpecifications.priceBetween(minPrice, maxPrice),
                PropertySpecifications.minBedrooms(minBedrooms),
                PropertySpecifications.minBathrooms(minBathrooms),
                PropertySpecifications.minSize(minSize)
        );

        return propertyRepo.findAll(spec, pageable);
    }

    @Override
    public Page<Property> listForOwner(Long ownerId, Pageable pageable) {
        ensureRole(ownerId, RoleType.OWNER);
        Specification<Property> spec = Specification.allOf(
                PropertySpecifications.ownerId(ownerId)
        );
        return propertyRepo.findAll(spec, pageable);
    }

    public Page<Property> listPendingForAdmin(Long adminId, Pageable pageable) {
        ensureRole(adminId, RoleType.ADMIN);
        Specification<Property> spec = Specification.allOf(
                PropertySpecifications.hasStatus(PropertyStatus.PENDING)
        );
        return propertyRepo.findAll(spec, pageable);
    }

    @Override
    public Page<Property> search(PropertyFilters filters) {
        return propertyRepo.findAll(filters.toSpec(), filters.getPageable());
    }

    @Override
    public Paginated<PropertyResponseDTO> searchDto(PropertyFilters filters) {
        Page<Property> page = search(filters);
        Page<PropertyResponseDTO> dtoPage = page.map(propertyMapper::toResponseDTO);
        return new Paginated<>(dtoPage);
    }
}

