package gr.ath.ds.rentsystem.mapper;

import gr.ath.ds.rentsystem.dto.ViewingRequestCreateRequestDTO;
import gr.ath.ds.rentsystem.dto.ViewingRequestResponseDTO;
import gr.ath.ds.rentsystem.model.ViewingRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.util.List;


@Mapper(config = MapStructCentralConfig.class)
public interface ViewingRequestMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenant", ignore = true)
    @Mapping(target = "property", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "requestedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ViewingRequest toEntity(ViewingRequestCreateRequestDTO dto);

    @Mapping(target = "tenantId", source = "tenant.id")
    @Mapping(target = "propertyId", source = "property.id")
    ViewingRequestResponseDTO toResponseDTO(ViewingRequest entity);

    List<ViewingRequestResponseDTO> toResponseDTOs(List<ViewingRequest> list);
    default Page<ViewingRequestResponseDTO> toResponsePage(Page<ViewingRequest> page) {
        return page.map(this::toResponseDTO);
    }
}

