package gr.ath.ds.rentsystem.mapper;

import gr.ath.ds.rentsystem.dto.PropertyCreateRequestDTO;
import gr.ath.ds.rentsystem.dto.PropertyResponseDTO;
import gr.ath.ds.rentsystem.model.Property;
import gr.ath.ds.rentsystem.util.enums.PropertyType;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.data.domain.Page;

import java.util.List;


@Mapper(config = MapStructCentralConfig.class)
public interface PropertyMapper {

    // CreateRequestDTO -> Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "type", expression = "java(toType(dto.getType()))")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Property toEntity(PropertyCreateRequestDTO dto);

    // Entity -> ResponseDTO
    @Mapping(target = "ownerId", source = "owner.id")
    PropertyResponseDTO toResponseDTO(Property entity);

    // Partial update
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "type", expression = "java(updateTypeIfPresent(dto.getType(), target))")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Property target, PropertyCreateRequestDTO dto);

    // Collections
    List<PropertyResponseDTO> toResponseDTOs(List<Property> entities);

    // Helper for Page
    default Page<PropertyResponseDTO> toResponsePage(Page<Property> page) {
        return page.map(this::toResponseDTO);
    }

    // Helpers
    default PropertyType toType(String s) {
        if (s == null || s.isBlank()) return null;
        return PropertyType.valueOf(s.toUpperCase());
    }
    default PropertyType updateTypeIfPresent(String s, Property target) {
        if (s == null || s.isBlank()) return target.getType();
        return toType(s);
    }
}
