package gr.ath.ds.rentsystem.mapper;

import gr.ath.ds.rentsystem.dto.UserRegisterRequestDTO;
import gr.ath.ds.rentsystem.dto.UserResponseDTO;
import gr.ath.ds.rentsystem.model.Role;
import gr.ath.ds.rentsystem.model.User;
import gr.ath.ds.rentsystem.util.enums.RoleType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(config = MapStructCentralConfig.class)
public interface UserMapper {

    // DTO -> Entity (register)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive",   constant = "true")
    @Mapping(target = "isVerified", constant = "false")
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "authorities", ignore = true)
    User toEntity(UserRegisterRequestDTO dto);

    // Entity -> DTO (read)
    @Mapping(target = "active",   source = "isActive")
    @Mapping(target = "verified", source = "isVerified")
    @Mapping(target = "roles", source = "roles", qualifiedByName = "rolesToRoleTypes")
    UserResponseDTO toResponseDTO(User user);

    List<UserResponseDTO> toResponseDTOs(List<User> users);

    @Named("rolesToRoleTypes")
    default Set<RoleType> rolesToRoleTypes(Set<Role> roles) {
        if (roles == null) return Set.of();
        return roles.stream()
                .map(Role::getName) // RoleType
                .collect(Collectors.toSet());
    }
}
