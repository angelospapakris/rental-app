package gr.ath.ds.rentsystem.mapper;

import gr.ath.ds.rentsystem.dto.AuthenticationResponseDTO;
import gr.ath.ds.rentsystem.model.Role;
import gr.ath.ds.rentsystem.model.User;
import gr.ath.ds.rentsystem.util.enums.RoleType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(config = MapStructCentralConfig.class)
public interface AuthMapper {

    @Mapping(target = "accessToken", expression = "java(token)")
    @Mapping(target = "expiresAt", expression = "java(expiresAt)")
    @Mapping(target = "tokenType", constant = "Bearer")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "roles", expression = "java(toRoleTypes(user))")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "firstname", source = "user.firstname")
    @Mapping(target = "lastname", source = "user.lastname")
    AuthenticationResponseDTO toAuthResponse(User user, String token, long expiresAt);

    // Helper for converting Set<Role> to Set<RoleType>
    default Set<RoleType> toRoleTypes(User user) {
        if (user == null || user.getRoles() == null) return Set.of();
        return user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
    }
}
