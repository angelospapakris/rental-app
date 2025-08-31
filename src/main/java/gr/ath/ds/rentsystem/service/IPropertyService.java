package gr.ath.ds.rentsystem.service;

import gr.ath.ds.rentsystem.dto.PropertyResponseDTO;
import gr.ath.ds.rentsystem.model.Property;
import gr.ath.ds.rentsystem.util.enums.PropertyStatus;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectAlreadyExists;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectNotFoundException;
import gr.ath.ds.rentsystem.util.filters.Paginated;
import gr.ath.ds.rentsystem.util.filters.PropertyFilters;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface IPropertyService {
    Property create(Long ownerId, Property dto);                      // OWNER
    Property update(Long ownerId, Long propertyId, Property dto);     // OWNER ( its own property)
    public void resubmit(Long ownerId, Long propertyId);              // OWNER
    void approve(Long adminId, Long propertyId) throws AppObjectNotFoundException, AppObjectAlreadyExists;                      // ADMIN
    void reject(Long adminId, Long propertyId);                       // ADMIN

    Page<Property> searchPublic(String city, String type, BigDecimal minPrice, BigDecimal maxPrice, Integer minBedrooms, Integer minBathrooms, Integer minSize, Pageable pageable);

    Page<Property> listForOwner(Long ownerId, Pageable pageable);
    Page<Property> listPendingForAdmin(Long adminId, Pageable pageable);

    // Core (entities)
    Page<Property> search(PropertyFilters filters);

    // Convenience (DTO + pagination wrapper)
    Paginated<PropertyResponseDTO> searchDto(PropertyFilters filters);
}

