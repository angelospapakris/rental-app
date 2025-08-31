package gr.ath.ds.rentsystem.service;

import gr.ath.ds.rentsystem.dto.UserResponseDTO;
import gr.ath.ds.rentsystem.mapper.UserMapper;
import gr.ath.ds.rentsystem.model.Role;
import gr.ath.ds.rentsystem.model.User;
import gr.ath.ds.rentsystem.repository.RoleRepository;
import gr.ath.ds.rentsystem.repository.UserRepository;
import gr.ath.ds.rentsystem.util.enums.RoleType;
import gr.ath.ds.rentsystem.util.filters.Paginated;
import gr.ath.ds.rentsystem.util.filters.UserFilters;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements gr.ath.ds.rentsystem.service.IUserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder encoder;
    private final UserMapper userMapper;

    private void ensureAdmin(Long adminId) {
        if (adminId == null || !userRepo.hasRole(adminId, RoleType.ADMIN))
            throw new SecurityException("Forbidden: ADMIN role required.");
    }

    @Transactional
    public User registerUser(String email, String username, String password, String firstname, String lastname, String phone, RoleType... roles) {
        User u = registerBase(email, username, password, firstname, lastname, phone);
        for (RoleType rt : roles) {
            Role r = roleRepo.findByName(rt).orElseThrow();
            u.getRoles().add(r);
            // TENANT by default unverified
            u.setIsVerified(rt == RoleType.OWNER);
        }
        return userRepo.save(u);
    }

    private User registerBase(String email, String username, String password, String firstname, String lastname, String phone) {
        if (userRepo.existsByEmail(email)) throw new IllegalArgumentException("Email already exists");
        if (userRepo.existsByUsername(username)) throw new IllegalArgumentException("Username already exists");

        User u = new User();
        u.setEmail(email);
        u.setUsername(username);
        u.setPassword(encoder.encode(password));
        u.setFirstname(firstname);
        u.setLastname(lastname);
        u.setPhone(phone);
        u.setIsActive(true);
        u.setIsVerified(false);
        return u;
    }

    @Override @Transactional
    public void verifyTenant(Long adminId, Long tenantUserId) {
        ensureAdmin(adminId);
        User u = userRepo.findById(tenantUserId).orElseThrow();
        if (!userRepo.hasRole(tenantUserId, RoleType.TENANT))
            throw new IllegalArgumentException("User is not TENANT.");
        u.setIsVerified(true);
        userRepo.save(u);
    }

    @Override @Transactional public void activate(Long adminId, Long userId)   { ensureAdmin(adminId); userRepo.findById(userId).ifPresent(u -> { u.setIsActive(true);  userRepo.save(u); }); }
    @Override @Transactional public void deactivate(Long adminId, Long userId) { ensureAdmin(adminId); userRepo.findById(userId).ifPresent(u -> { u.setIsActive(false); userRepo.save(u); }); }

    @Override @Transactional
    public void assignRole(Long adminId, Long userId, RoleType role) {
        ensureAdmin(adminId);
        User u = userRepo.findById(userId).orElseThrow();
        Role r = roleRepo.findByName(role).orElseThrow();
        u.getRoles().add(r);
        userRepo.save(u);
    }

    @Override @Transactional
    public void removeRole(Long adminId, Long userId, RoleType role) {
        ensureAdmin(adminId);
        User u = userRepo.findById(userId).orElseThrow();
        u.getRoles().removeIf(rr -> rr.getName() == role);
        userRepo.save(u);
    }

    @Override public Optional<User> getById(Long id) { return userRepo.findById(id); }
    @Override public Optional<User> getByEmail(String email) { return userRepo.findByEmail(email); }
    @Override public boolean hasRole(Long userId, RoleType role) { return userRepo.hasRole(userId, role); }

    @Override
    public Page<User> search(UserFilters filters) {
        return userRepo.findAll(filters.toSpec(), filters.getPageable());
    }

    @Override
    public Paginated<UserResponseDTO> searchDto(UserFilters filters) {
        Page<User> page = search(filters);
        Page<UserResponseDTO> dtoPage = page.map(userMapper::toResponseDTO);
        return new Paginated<>(dtoPage);
    }
}

