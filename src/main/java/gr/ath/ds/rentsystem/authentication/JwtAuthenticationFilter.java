package gr.ath.ds.rentsystem.authentication;

import gr.ath.ds.rentsystem.security.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(

            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        try {
            final String subject = jwtService.extractSubject(token); // email ή username, ανάλογα με το JwtService σου

            List<String> roles = null;
            try {
                roles = jwtService.getListClaim(token, "roles", String.class);
            } catch (Exception ignored) {
                // Αν δεν υπάρχει claim ή helper, απλά προχώρα.
            }

            if (subject != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(subject);

                if (jwtService.isTokenValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    LOGGER.warn("Invalid JWT for subject={} path={}", subject, request.getRequestURI());
                    writeJsonError(response, HttpStatus.UNAUTHORIZED, "invalid_token", "Token is not valid");
                    return;
                }
            }

        } catch (ExpiredJwtException e) {
            LOGGER.warn("Expired token at path={}", request.getRequestURI());
            writeJsonError(response, HttpStatus.UNAUTHORIZED, "expired_token", "Token has expired");
            return;
        } catch (MalformedJwtException | SignatureException e) {
            LOGGER.warn("Malformed/Signature JWT at path={} reason={}", request.getRequestURI(), e.getMessage());
            writeJsonError(response, HttpStatus.UNAUTHORIZED, "invalid_token", "Malformed or invalid signature");
            return;
        } catch (IllegalArgumentException e) {
            LOGGER.warn("IllegalArgument while parsing JWT at path={} reason={}", request.getRequestURI(), e.getMessage());
            writeJsonError(response, HttpStatus.UNAUTHORIZED, "invalid_token", "Invalid token");
            return;
        } catch (Exception e) {
            // Οτιδήποτε άλλο σχετικό με JWT parsing → 401
            LOGGER.warn("JWT parsing error path={} reason={}", request.getRequestURI(), e.getMessage());
            writeJsonError(response, HttpStatus.UNAUTHORIZED, "invalid_token", "Unable to parse token");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void writeJsonError(HttpServletResponse response, HttpStatus status, String code, String message) throws IOException {
        response.setStatus(status.value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String body = "{\"code\":\"" + code + "\",\"message\":\"" + message + "\"}";
        response.getWriter().write(body);
    }
}
