package com.proyectoPortafolio.eventout_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

/**
 * Envío de correos vía JavaMailSender. Si el SMTP no está configurado
 * (sin usuario/clave), no falla: registra el contenido en el log para que el
 * flujo de recuperación siga siendo demostrable en desarrollo.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String from;
    private final boolean mailConfigurado;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String from,
            @Value("${spring.mail.username:}") String mailUsername
    ) {
        this.mailSender = mailSender;
        this.from = from;
        this.mailConfigurado = mailUsername != null && !mailUsername.isBlank();
    }

    public void enviarRecuperacionPassword(String destino, String nombre, String enlace) {
        String asunto = "Recupera tu contraseña — Eventout";
        String html = """
                <div style="font-family:system-ui,Arial,sans-serif;max-width:480px;margin:auto">
                  <h2 style="color:#c04f23">Eventout</h2>
                  <p>Hola %s,</p>
                  <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el
                     siguiente botón para elegir una nueva. El enlace expira en 1 hora.</p>
                  <p style="text-align:center;margin:28px 0">
                    <a href="%s" style="background:#c04f23;color:#fff;padding:12px 24px;
                       border-radius:8px;text-decoration:none;font-weight:600">
                       Restablecer contraseña</a>
                  </p>
                  <p style="color:#666;font-size:13px">Si no solicitaste esto, ignora este correo.</p>
                  <p style="color:#999;font-size:12px">Si el botón no funciona, copia este enlace:<br>%s</p>
                </div>
                """.formatted(nombre, enlace, enlace);

        if (!mailConfigurado) {
            log.warn("[EmailService] SMTP no configurado. Correo de recuperación NO enviado.");
            log.warn("[EmailService] Destino={} | Enlace de recuperación={}", destino, enlace);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(from);
            helper.setTo(destino);
            helper.setSubject(asunto);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("[EmailService] Correo de recuperación enviado a {}", destino);
        } catch (Exception ex) {
            log.error("[EmailService] Error enviando correo de recuperación a {}: {}", destino, ex.getMessage());
        }
    }
}
