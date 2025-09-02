package gr.ath.ds.rentsystem.util.filters;

import gr.ath.ds.rentsystem.model.User;
import gr.ath.ds.rentsystem.util.enums.RoleType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.Specification;

@Getter
@Setter
public class UserFilters extends GenericFilters {

    private String email;
    private String username;
    private Boolean active;
    private Boolean verified;
    private RoleType role;

    public Specification<User> toSpec() {
        return Specification.allOf(
                (root, q, cb) -> (email == null || email.isBlank())
                        ? cb.conjunction()
                        : cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() + "%"),

                (root, q, cb) -> (username == null || username.isBlank())
                        ? cb.conjunction()
                        : cb.like(cb.lower(root.get("username")), "%" + username.toLowerCase() + "%"),

                (root, q, cb) -> (active == null)
                        ? cb.conjunction()
                        : cb.equal(root.get("isActive"), active),

                (root, q, cb) -> (verified == null)
                        ? cb.conjunction()
                        : cb.equal(root.get("isVerified"), verified),

                (root, q, cb) -> {
                    if (role == null) return cb.conjunction();
                    var rolesJoin = root.join("roles"); // join στον πίνακα user_roles
                    return cb.equal(rolesJoin.get("name"), role);
                }
        );
    }
}


