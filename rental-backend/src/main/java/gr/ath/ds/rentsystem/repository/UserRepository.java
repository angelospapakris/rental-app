package gr.ath.ds.rentsystem.repository;

import gr.ath.ds.rentsystem.model.User;
import gr.ath.ds.rentsystem.util.enums.RoleType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);

    @Query("""
           select (count(u) > 0)
           from User u join u.roles r
           where u.id = :userId and r.name = :role
           """)
    boolean hasRole(@Param("userId") Long userId, @Param("role") RoleType role);
}

