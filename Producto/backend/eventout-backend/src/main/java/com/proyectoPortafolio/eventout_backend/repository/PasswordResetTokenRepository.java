package com.proyectoPortafolio.eventout_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.proyectoPortafolio.eventout_backend.model.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {
}
