package com.proyectoPortafolio.eventout_backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.proyectoPortafolio.eventout_backend.dto.AuthResponse;
import com.proyectoPortafolio.eventout_backend.dto.request.LoginRequest;
import com.proyectoPortafolio.eventout_backend.dto.request.NuevaPasswordRequest;
import com.proyectoPortafolio.eventout_backend.dto.request.RecuperarPasswordRequest;
import com.proyectoPortafolio.eventout_backend.dto.request.RegisterRequest;
import com.proyectoPortafolio.eventout_backend.exception.BadRequestException;
import com.proyectoPortafolio.eventout_backend.exception.ConflictException;
import com.proyectoPortafolio.eventout_backend.exception.NotFoundException;
import com.proyectoPortafolio.eventout_backend.exception.UnauthorizedException;
import com.proyectoPortafolio.eventout_backend.model.PasswordResetToken;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.repository.PasswordResetTokenRepository;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;
import com.proyectoPortafolio.eventout_backend.security.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UsuarioRepository usuarioRepository;
    @Mock PasswordResetTokenRepository tokenRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock EmailService emailService;

    AuthService service;

    @BeforeEach
    void setUp() {
        // El constructor recibe primitivos @Value, así que no sirve @InjectMocks.
        service = new AuthService(usuarioRepository, tokenRepository, passwordEncoder,
                jwtService, emailService, 3_600_000L, "http://front.test");
    }

    private Usuario usuario() {
        return Usuario.builder().id("u1").email("ana@mail.com").nombre("Ana")
                .passwordHash("hash").build();
    }

    // ---- register ---------------------------------------------------------

    @Test
    void register_emailDuplicado_lanzaConflict() {
        when(usuarioRepository.existsByEmail("ana@mail.com")).thenReturn(true);

        assertThatThrownBy(() -> service.register(
                new RegisterRequest("Ana", "ANA@mail.com", "secret1")))
                .isInstanceOf(ConflictException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void register_normalizaEmailYNombre_yDevuelveToken() {
        when(usuarioRepository.existsByEmail("ana@mail.com")).thenReturn(false);
        when(passwordEncoder.encode("secret1")).thenReturn("HASH");
        when(usuarioRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generarToken(any())).thenReturn("tok");

        AuthResponse res = service.register(
                new RegisterRequest("  Ana  ", " ANA@Mail.COM ", "secret1"));

        assertThat(res.token()).isEqualTo("tok");
        assertThat(res.usuario().email()).isEqualTo("ana@mail.com");
        assertThat(res.usuario().nombre()).isEqualTo("Ana");
        verify(passwordEncoder).encode("secret1");
    }

    // ---- login ------------------------------------------------------------

    @Test
    void login_emailInexistente_lanzaUnauthorized() {
        when(usuarioRepository.findByEmail("ana@mail.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.login(new LoginRequest("ana@mail.com", "x")))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void login_passwordIncorrecta_lanzaUnauthorized() {
        when(usuarioRepository.findByEmail("ana@mail.com")).thenReturn(Optional.of(usuario()));
        when(passwordEncoder.matches("mala", "hash")).thenReturn(false);

        assertThatThrownBy(() -> service.login(new LoginRequest("ana@mail.com", "mala")))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void login_correcto_devuelveToken() {
        when(usuarioRepository.findByEmail("ana@mail.com")).thenReturn(Optional.of(usuario()));
        when(passwordEncoder.matches("secret1", "hash")).thenReturn(true);
        when(jwtService.generarToken(any())).thenReturn("tok");

        AuthResponse res = service.login(new LoginRequest("ana@mail.com", "secret1"));

        assertThat(res.token()).isEqualTo("tok");
        assertThat(res.usuario().idUsuario()).isEqualTo("u1");
    }

    // ---- me ---------------------------------------------------------------

    @Test
    void me_idInexistente_lanzaNotFound() {
        when(usuarioRepository.findById("u1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.me("u1")).isInstanceOf(NotFoundException.class);
    }

    // ---- recuperarPassword ------------------------------------------------

    @Test
    void recuperarPassword_emailInexistente_noEnviaCorreo() {
        when(usuarioRepository.findByEmail("ana@mail.com")).thenReturn(Optional.empty());

        service.recuperarPassword(new RecuperarPasswordRequest("ana@mail.com"));

        verify(tokenRepository, never()).save(any());
        verify(emailService, never()).enviarRecuperacionPassword(anyString(), anyString(), anyString());
    }

    @Test
    void recuperarPassword_emailExistente_guardaTokenYEnviaCorreo() {
        when(usuarioRepository.findByEmail("ana@mail.com")).thenReturn(Optional.of(usuario()));

        service.recuperarPassword(new RecuperarPasswordRequest("ana@mail.com"));

        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).enviarRecuperacionPassword(anyString(), anyString(), anyString());
    }

    // ---- nuevaPassword ----------------------------------------------------

    @Test
    void nuevaPassword_tokenInexistente_lanzaBadRequest() {
        when(tokenRepository.findById("t1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.nuevaPassword(new NuevaPasswordRequest("t1", "nueva1")))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void nuevaPassword_tokenUsado_lanzaBadRequest() {
        PasswordResetToken t = PasswordResetToken.builder().token("t1").usuario(usuario())
                .expiresAt(Instant.now().plusSeconds(60)).used(true).build();
        when(tokenRepository.findById("t1")).thenReturn(Optional.of(t));

        assertThatThrownBy(() -> service.nuevaPassword(new NuevaPasswordRequest("t1", "nueva1")))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void nuevaPassword_tokenExpirado_lanzaBadRequest() {
        PasswordResetToken t = PasswordResetToken.builder().token("t1").usuario(usuario())
                .expiresAt(Instant.now().minusSeconds(60)).used(false).build();
        when(tokenRepository.findById("t1")).thenReturn(Optional.of(t));

        assertThatThrownBy(() -> service.nuevaPassword(new NuevaPasswordRequest("t1", "nueva1")))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void nuevaPassword_valido_actualizaHashYMarcaTokenUsado() {
        Usuario u = usuario();
        PasswordResetToken t = PasswordResetToken.builder().token("t1").usuario(u)
                .expiresAt(Instant.now().plusSeconds(60)).used(false).build();
        when(tokenRepository.findById("t1")).thenReturn(Optional.of(t));
        when(passwordEncoder.encode("nueva1")).thenReturn("NEWHASH");

        service.nuevaPassword(new NuevaPasswordRequest("t1", "nueva1"));

        assertThat(u.getPasswordHash()).isEqualTo("NEWHASH");
        assertThat(t.isUsed()).isTrue();
        verify(usuarioRepository).save(u);
        verify(tokenRepository).save(t);
    }
}
