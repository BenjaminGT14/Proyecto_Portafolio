package com.proyectoPortafolio.eventout_backend.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.proyectoPortafolio.eventout_backend.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final String frontendUrl;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            @Value("${app.frontend.url}") String frontendUrl
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.frontendUrl = frontendUrl;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Documentación
                        .requestMatchers(
                                "/swagger-ui/**", "/swagger-ui.html",
                                "/v3/api-docs/**", "/v3/api-docs")
                        .permitAll()
                        // Auth pública
                        .requestMatchers(
                                "/auth/register", "/auth/login",
                                "/auth/recuperar-password", "/auth/nueva-password")
                        .permitAll()
                        // Lecturas públicas
                        .requestMatchers(HttpMethod.GET, "/categorias", "/categorias/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/lugares", "/lugares/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/eventos", "/eventos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/resenas", "/resenas/destacadas").permitAll()
                        // Administración
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        // El resto requiere autenticación
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> writeJsonError(res, HttpStatus.UNAUTHORIZED, "No autenticado"))
                        .accessDeniedHandler((req, res, e) -> writeJsonError(res, HttpStatus.FORBIDDEN, "Acceso denegado")))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void writeJsonError(jakarta.servlet.http.HttpServletResponse res, HttpStatus status, String mensaje)
            throws java.io.IOException {
        res.setStatus(status.value());
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding("UTF-8");
        res.getWriter().write("{\"error\":\"" + mensaje + "\"}");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendUrl, "http://localhost:5173", "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
