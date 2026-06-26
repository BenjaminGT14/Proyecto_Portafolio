package com.proyectoPortafolio.eventout_backend;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.proyectoPortafolio.eventout_backend.dto.request.LoginRequest;
import com.proyectoPortafolio.eventout_backend.dto.request.RegisterRequest;
import com.proyectoPortafolio.eventout_backend.exception.ConflictException;
import com.proyectoPortafolio.eventout_backend.exception.UnauthorizedException;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.model.enums.EstadoUsuario;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;
import com.proyectoPortafolio.eventout_backend.security.JwtService;
import com.proyectoPortafolio.eventout_backend.service.AuthService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UsuarioRepository usuarioRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;

    AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(usuarioRepository, passwordEncoder, jwtService);
    }

    private Usuario usuario() {
        return Usuario.builder().id("u1").email("ana@mail.com").nombre("Ana")
                .passwordHash("hash").build();
    }

    @Test
    void register_emailDuplicado_lanzaConflict() {
        when(usuarioRepository.existsByEmail("ana@mail.com")).thenReturn(true);

        assertThatThrownBy(() -> service.register(
                new RegisterRequest("Ana", "ANA@mail.com", "secret1")))
                .isInstanceOf(ConflictException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void login_passwordIncorrecta_lanzaUnauthorized() {
        when(usuarioRepository.findByEmail("ana@mail.com")).thenReturn(Optional.of(usuario()));
        when(passwordEncoder.matches("mala", "hash")).thenReturn(false);

        assertThatThrownBy(() -> service.login(new LoginRequest("ana@mail.com", "mala")))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void login_usuarioBloqueado_lanzaUnauthorized() {
        Usuario bloqueado = Usuario.builder().id("u1").email("ana@mail.com").nombre("Ana")
                .passwordHash("hash").estado(EstadoUsuario.BLOQUEADO).build();
        when(usuarioRepository.findByEmail("ana@mail.com")).thenReturn(Optional.of(bloqueado));
        when(passwordEncoder.matches("secret1", "hash")).thenReturn(true);

        assertThatThrownBy(() -> service.login(new LoginRequest("ana@mail.com", "secret1")))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void me_usuarioBloqueado_lanzaUnauthorized() {
        Usuario bloqueado = Usuario.builder().id("u1").email("ana@mail.com").nombre("Ana")
                .passwordHash("hash").estado(EstadoUsuario.BLOQUEADO).build();
        when(usuarioRepository.findById("u1")).thenReturn(Optional.of(bloqueado));

        assertThatThrownBy(() -> service.me("u1"))
                .isInstanceOf(UnauthorizedException.class);
    }
}
