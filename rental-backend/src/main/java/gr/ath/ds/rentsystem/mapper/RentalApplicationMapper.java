package gr.ath.ds.rentsystem.mapper;

import gr.ath.ds.rentsystem.dto.RentalApplicationCreateRequestDTO;
import gr.ath.ds.rentsystem.dto.RentalApplicationResponseDTO;
import gr.ath.ds.rentsystem.model.RentalApplication;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.util.List;


@Mapper(config = MapStructCentralConfig.class)
public interface RentalApplicationMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenant", ignore = true)
    @Mapping(target = "property", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    RentalApplication toEntity(RentalApplicationCreateRequestDTO dto);

    @Mapping(target = "tenantId", source = "tenant.id")
    @Mapping(target = "propertyId", source = "property.id")
    RentalApplicationResponseDTO toResponseDTO(RentalApplication entity);

    List<RentalApplicationResponseDTO> toResponseDTOs(List<RentalApplication> list);
    default Page<RentalApplicationResponseDTO> toResponsePage(Page<RentalApplication> page) {
        return page.map(this::toResponseDTO);
    }
}

