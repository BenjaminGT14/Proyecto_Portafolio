package com.proyectoPortafolio.eventout_backend.mapper;

import com.proyectoPortafolio.eventout_backend.dto.AutorDto;
import com.proyectoPortafolio.eventout_backend.dto.CategoriaDto;
import com.proyectoPortafolio.eventout_backend.dto.EventoDto;
import com.proyectoPortafolio.eventout_backend.dto.LugarDto;
import com.proyectoPortafolio.eventout_backend.dto.ResenaDto;
import com.proyectoPortafolio.eventout_backend.dto.UsuarioDto;
import com.proyectoPortafolio.eventout_backend.dto.VotoDto;
import com.proyectoPortafolio.eventout_backend.model.Categoria;
import com.proyectoPortafolio.eventout_backend.model.Evento;
import com.proyectoPortafolio.eventout_backend.model.Lugar;
import com.proyectoPortafolio.eventout_backend.model.Resena;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.model.VotoResena;

/**
 * Conversión entidad -> DTO. Debe invocarse dentro de un contexto transaccional
 * (servicios @Transactional) porque navega asociaciones LAZY.
 */
public final class DtoMapper {

    private DtoMapper() {
    }

    public static CategoriaDto toCategoriaDto(Categoria c) {
        if (c == null) return null;
        return new CategoriaDto(c.getId(), c.getNombre(), c.getIcono());
    }

    public static UsuarioDto toUsuarioDto(Usuario u) {
        if (u == null) return null;
        return new UsuarioDto(u.getId(), u.getEmail(), u.getNombre(), u.getAvatarUrl(), u.getRol());
    }

    public static AutorDto toAutorDto(Usuario u) {
        if (u == null) return null;
        return new AutorDto(u.getId(), u.getNombre(), u.getAvatarUrl());
    }

    public static LugarDto toLugarDto(Lugar l) {
        if (l == null) return null;
        Categoria cat = l.getCategoria();
        return new LugarDto(
                l.getId(),
                cat != null ? cat.getId() : null,
                l.getNombre(),
                l.getDescripcion(),
                l.getDireccion(),
                l.getComuna(),
                l.getLatitud(),
                l.getLongitud(),
                l.getEsGratuito(),
                l.getPrecio(),
                l.getHorario(),
                l.getImagenUrl(),
                l.getWikipediaSlug(),
                l.getCreatedAt(),
                toCategoriaDto(cat)
        );
    }

    public static EventoDto toEventoDto(Evento e) {
        if (e == null) return null;
        Lugar l = e.getLugar();
        return new EventoDto(
                e.getId(),
                l != null ? l.getId() : null,
                e.getNombre(),
                e.getDescripcion(),
                e.getFechaInicio(),
                e.getFechaFin(),
                e.getEsGratuito(),
                e.getPrecio(),
                e.getImagenUrl(),
                e.getEstado(),
                toAutorDto(e.getPropuestoPor()),
                e.getCreatedAt(),
                toLugarDto(l)
        );
    }

    public static VotoDto toVotoDto(VotoResena v) {
        if (v == null) return null;
        return new VotoDto(v.getId(), v.getUsuario().getId(), v.getResena().getId(), v.getEsPositivo());
    }

    /** Reseña pública: incluye conteo de votos + autor (sin lugar/evento). */
    public static ResenaDto toResenaDto(Resena r, long positivos, long negativos) {
        return buildResena(r, positivos, negativos, false);
    }

    /** Reseña para el panel admin: además incluye el lugar/evento asociado. */
    public static ResenaDto toResenaAdminDto(Resena r, long positivos, long negativos) {
        return buildResena(r, positivos, negativos, true);
    }

    private static ResenaDto buildResena(Resena r, long positivos, long negativos, boolean incluirTarget) {
        if (r == null) return null;
        Lugar lugar = r.getLugar();
        Evento evento = r.getEvento();
        return new ResenaDto(
                r.getId(),
                r.getUsuario() != null ? r.getUsuario().getId() : null,
                lugar != null ? lugar.getId() : null,
                evento != null ? evento.getId() : null,
                r.getTitulo(),
                r.getContenido(),
                r.getPuntuacion(),
                r.getEstado(),
                r.getCreatedAt(),
                positivos,
                negativos,
                positivos - negativos,
                toAutorDto(r.getUsuario()),
                incluirTarget ? toLugarDto(lugar) : null,
                incluirTarget ? toEventoDto(evento) : null
        );
    }
}
