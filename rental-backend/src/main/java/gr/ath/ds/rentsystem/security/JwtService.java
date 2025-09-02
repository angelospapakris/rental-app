package gr.ath.ds.rentsystem.security;

import gr.ath.ds.rentsystem.model.Role;
import gr.ath.ds.rentsystem.model.User;
import gr.ath.ds.rentsystem.util.enums.RoleType;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JwtService {

    @Value("${jwt.secret:VGhpc0lzQVVuaXF1ZVN1cGVyU2VjcmV0S2V5VGhhdElzQmFzZTY0RW5jb2RlZA==}")
    private String secretBase64; // 256-bit+ base64 secret

    @Value("${security.jwt.expiration-ms:3600000}")
    private long expirationMs;

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretBase64);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", user.getRoles().stream()
                .map(Role::getName)         // RoleType
                .map(Enum::name)            // "ADMIN","OWNER","TENANT"
                .map(r -> "ROLE_" + r)      // "ROLE_ADMIN", ...
                .collect(Collectors.toList()));
        claims.put("uid", user.getId());

        String subject = user.getEmail() != null ? user.getEmail() : user.getUsername();

        Instant now = Instant.now();
        Instant exp = now.plusMillis(expirationMs);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(String subject, Collection<RoleType> roles) {
        final List<String> roleClaims = roles == null ? List.of() :
                roles.stream().map(Enum::name).map(r -> "ROLE_" + r).toList();
        return buildToken(subject, roleClaims, Collections.emptyMap());
    }

    private String buildToken(String subject, List<String> roleClaims, Map<String, Object> extraClaims) {
        Instant now = Instant.now();
        Instant exp = now.plusMillis(expirationMs);

        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", roleClaims);
        claims.putAll(extraClaims);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String subject = extractSubject(token);
        return subject.equalsIgnoreCase(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public String extractSubject(String token) {
        return parseAllClaims(token).getSubject();
    }

    public Instant getExpirationInstant() {
        return Instant.now().plusMillis(expirationMs);
    }

    private boolean isTokenExpired(String token) {
        Date exp = parseAllClaims(token).getExpiration();
        return exp.before(new Date());
    }

    private Claims parseAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> List<T> getListClaim(String token, String claimName, Class<T> itemClass) {
        var claims = parseAllClaims(token);
        Object raw = claims.get(claimName);
        if (raw instanceof List<?> list) {
            return list.stream()
                    .filter(itemClass::isInstance)
                    .map(itemClass::cast)
                    .toList();
        }
        return List.of();
    }


    public String getStringClaim(String token, String claimName) {
        Object raw = parseAllClaims(token).get(claimName);
        return raw != null ? String.valueOf(raw) : null;
    }
}
