package gr.ath.ds.rentsystem.authentication;

import gr.ath.ds.rentsystem.dto.AuthenticationRequestDTO;
import gr.ath.ds.rentsystem.dto.AuthenticationResponseDTO;
import gr.ath.ds.rentsystem.mapper.AuthMapper;
import gr.ath.ds.rentsystem.model.User;
import gr.ath.ds.rentsystem.repository.UserRepository;
import gr.ath.ds.rentsystem.security.JwtService;
import gr.ath.ds.rentsystem.util.exceptions.AppObjectNotAuthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthMapper authMapper;

    @Transactional(readOnly = true)
    public AuthenticationResponseDTO authenticate(AuthenticationRequestDTO dto) throws AppObjectNotAuthorizedException {
        final String uoe = dto.getUsernameOrEmail();

        User user = userRepo.findByEmail(uoe)
                .or(() -> userRepo.findByUsername(uoe))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new gr.ath.ds.rentsystem.util.exceptions.AppObjectNotAuthorizedException(
                    "account_disabled", "Account is disabled"
            );
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);
        long expMs = jwtService.getExpirationInstant().toEpochMilli();

        return authMapper.toAuthResponse(user, token, expMs);
    }
}
