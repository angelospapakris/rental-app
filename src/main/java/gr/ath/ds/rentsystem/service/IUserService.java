package gr.ath.ds.rentsystem.service;

import gr.ath.ds.rentsystem.dto.UserResponseDTO;
import gr.ath.ds.rentsystem.model.User;
import gr.ath.ds.rentsystem.util.enums.RoleType;
import gr.ath.ds.rentsystem.util.filters.Paginated;
import gr.ath.ds.rentsystem.util.filters.UserFilters;
import org.springframework.data.domain.Page;

import java.util.Optional;

public interface IUserService {
    User registerUser(String email, String username, String password, String firstname, String lastname, String phone, RoleType... roles);

    void verifyTenant(Long adminId, Long tenantUserId);              // ADMIN only
    void activate(Long adminId, Long userId);                        // ADMIN only
    void deactivate(Long adminId, Long userId);                      // ADMIN only

    void assignRole(Long adminId, Long userId, RoleType role);       // ADMIN only
    void removeRole(Long adminId, Long userId, RoleType role);       // ADMIN only

    Optional<User> getById(Long id);
    Optional<User> getByEmail(String email);
    boolean hasRole(Long userId, RoleType role);

    // Core
    Page<User> search(UserFilters filters);

    // Convenience
    Paginated<UserResponseDTO> searchDto(UserFilters filters);
}
