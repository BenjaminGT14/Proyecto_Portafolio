package com.proyectoPortafolio.eventout_backend.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectoPortafolio.eventout_backend.dto.AuthResponse;
import com.proyectoPortafolio.eventout_backend.dto.UsuarioDto;
import com.proyectoPortafolio.eventout_backend.dto.request.LoginRequest;
import com.proyectoPortafolio.eventout_backend.dto.request.NuevaPasswordRequest;
import com.proyectoPortafolio.eventout_backend.dto.request.RecuperarPasswordRequest;
import com.proyectoPortafolio.eventout_backend.dto.request.RegisterRequest;
import com.proyectoPortafolio.eventout_backend.exception.BadRequestException;
import com.proyectoPortafolio.eventout_backend.exception.ConflictException;
import com.proyectoPortafolio.eventout_backend.exception.NotFoundException;
import com.proyectoPortafolio.eventout_backend.exception.UnauthorizedException;
import com.proyectoPortafolio.eventout_backend.mapper.DtoMapper;
import com.proyectoPortafolio.eventout_backend.model.PasswordResetToken;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.model.enums.EstadoUsuario;
import com.proyectoPortafolio.eventout_backend.model.enums.Rol;
import com.proyectoPortafolio.eventout_backend.repository.PasswordResetTokenRepository;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;
import com.proyectoPortafolio.eventout_backend.security.JwtService;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final long resetExpirationMs;
    private final String frontendUrl;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            @Value("${app.jwt.reset-expiration-ms}") long resetExpirationMs,
            @Value("${app.frontend.url}") String frontendUrl
    ) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.resetExpirationMs = resetExpirationMs;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmail(email)) {
            throw new ConflictException("Ya existe una cuenta con ese email");
        }
        Usuario usuario = Usuario.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(req.password()))
                .nombre(req.nombre().trim())
                .avatarUrl(avatarPorDefecto(req.nombre().trim()))
                .rol(Rol.USER)
                .build();
        usuario = usuarioRepository.save(usuario);
        return new AuthResponse(jwtService.generarToken(usuario), DtoMapper.toUsuarioDto(usuario));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Email o contraseña incorrectos"));
        if (!passwordEncoder.matches(req.password(), usuario.getPasswordHash())) {
            throw new UnauthorizedException("Email o contraseña incorrectos");
        }
        verificarHabilitado(usuario);
        return new AuthResponse(jwtService.generarToken(usuario), DtoMapper.toUsuarioDto(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioDto me(String idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        verificarHabilitado(usuario);
        return DtoMapper.toUsuarioDto(usuario);
    }

    /**
     * Rechaza con 401 a las cuentas que no están ACTIVO. Es el punto de
     * enforcement de estado: el frontend valida la sesión contra /auth/me y, si
     * la cuenta quedó BLOQUEADA en BD, recibe 401 y limpia la sesión local.
     */
    private void verificarHabilitado(Usuario usuario) {
        if (usuario.getEstado() != EstadoUsuario.ACTIVO) {
            throw new UnauthorizedException("Tu cuenta está deshabilitada. Contacta al administrador.");
        }
    }

    /**
     * Genera un token de recuperación y envía el correo. No revela si el email
     * existe (para evitar enumeración de usuarios).
     */
    @Transactional
    public void recuperarPassword(RecuperarPasswordRequest req) {
        String email = req.email().trim().toLowerCase();
        usuarioRepository.findByEmail(email).ifPresent(usuario -> {
            PasswordResetToken token = PasswordResetToken.builder()
                    .token(UUID.randomUUID().toString())
                    .usuario(usuario)
                    .expiresAt(Instant.now().plusMillis(resetExpirationMs))
                    .used(false)
                    .build();
            tokenRepository.save(token);
            String enlace = frontendUrl + "/recuperar-password/nueva?token="
                    + URLEncoder.encode(token.getToken(), StandardCharsets.UTF_8);
            emailService.enviarRecuperacionPassword(usuario.getEmail(), usuario.getNombre(), enlace);
        });
    }

    @Transactional
    public void nuevaPassword(NuevaPasswordRequest req) {
        PasswordResetToken token = tokenRepository.findById(req.token())
                .orElseThrow(() -> new BadRequestException("El enlace de recuperación no es válido"));
        if (token.isUsed()) {
            throw new BadRequestException("El enlace de recuperación ya fue utilizado");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("El enlace de recuperación expiró");
        }
        Usuario usuario = token.getUsuario();
        usuario.setPasswordHash(passwordEncoder.encode(req.password()));
        usuarioRepository.save(usuario);
        token.setUsed(true);
        tokenRepository.save(token);
    }

    private String avatarPorDefecto(String nombre) {
        String seed = URLEncoder.encode(nombre, StandardCharsets.UTF_8);
        return "https://api.dicebear.com/9.x/initials/svg?seed=" + seed
                + "&backgroundColor=c04f23&textColor=ffffff&radius=50";
    }
}
