package com.proyectoPortafolio.eventout_backend.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectoPortafolio.eventout_backend.dto.AuthResponse;
import com.proyectoPortafolio.eventout_backend.dto.UsuarioDto;
import com.proyectoPortafolio.eventout_backend.dto.request.LoginRequest;
import com.proyectoPortafolio.eventout_backend.dto.request.RegisterRequest;
import com.proyectoPortafolio.eventout_backend.exception.ConflictException;
import com.proyectoPortafolio.eventout_backend.exception.NotFoundException;
import com.proyectoPortafolio.eventout_backend.exception.UnauthorizedException;
import com.proyectoPortafolio.eventout_backend.mapper.DtoMapper;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.model.enums.EstadoUsuario;
import com.proyectoPortafolio.eventout_backend.model.enums.Rol;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;
import com.proyectoPortafolio.eventout_backend.security.JwtService;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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

    private String avatarPorDefecto(String nombre) {
        String seed = URLEncoder.encode(nombre, StandardCharsets.UTF_8);
        return "https://api.dicebear.com/9.x/initials/svg?seed=" + seed
                + "&backgroundColor=c04f23&textColor=ffffff&radius=50";
    }
}
