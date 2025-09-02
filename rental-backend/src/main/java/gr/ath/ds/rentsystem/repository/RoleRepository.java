package gr.ath.ds.rentsystem.repository;

import gr.ath.ds.rentsystem.model.Role;
import gr.ath.ds.rentsystem.util.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long>, JpaSpecificationExecutor<Role> {
    Optional<Role> findByName(RoleType name);
    boolean existsByName(RoleType name);
}
