package com.proyectoPortafolio.eventout_backend.service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.proyectoPortafolio.eventout_backend.dto.ResenaDto;
import com.proyectoPortafolio.eventout_backend.dto.request.ResenaRequest;
import com.proyectoPortafolio.eventout_backend.exception.BadRequestException;
import com.proyectoPortafolio.eventout_backend.exception.NotFoundException;
import com.proyectoPortafolio.eventout_backend.mapper.DtoMapper;
import com.proyectoPortafolio.eventout_backend.model.Evento;
import com.proyectoPortafolio.eventout_backend.model.Lugar;
import com.proyectoPortafolio.eventout_backend.model.Resena;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.model.enums.EstadoResena;
import com.proyectoPortafolio.eventout_backend.repository.EventoRepository;
import com.proyectoPortafolio.eventout_backend.repository.LugarRepository;
import com.proyectoPortafolio.eventout_backend.repository.ResenaRepository;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;
import com.proyectoPortafolio.eventout_backend.repository.VotoResenaRepository;

@Service
public class ResenaService {

    private final ResenaRepository resenaRepository;
    private final VotoResenaRepository votoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LugarRepository lugarRepository;
    private final EventoRepository eventoRepository;

    public ResenaService(
            ResenaRepository resenaRepository,
            VotoResenaRepository votoRepository,
            UsuarioRepository usuarioRepository,
            LugarRepository lugarRepository,
            EventoRepository eventoRepository
    ) {
        this.resenaRepository = resenaRepository;
        this.votoRepository = votoRepository;
        this.usuarioRepository = usuarioRepository;
        this.lugarRepository = lugarRepository;
        this.eventoRepository = eventoRepository;
    }

    /** Reseñas visibles de un lugar XOR un evento, ordenadas por score y fecha. */
    @Transactional(readOnly = true)
    public List<ResenaDto> listarPublicas(String idLugar, String idEvento) {
        validarXor(idLugar, idEvento);
        List<Resena> resenas = StringUtils.hasText(idLugar)
                ? resenaRepository.findByLugarIdAndEstado(idLugar, EstadoResena.VISIBLE)
                : resenaRepository.findByEventoIdAndEstado(idEvento, EstadoResena.VISIBLE);

        Map<String, long[]> conteos = conteos(resenas);
        return resenas.stream()
                .map(r -> {
                    long[] c = conteos.getOrDefault(r.getId(), new long[]{0, 0});
                    return DtoMapper.toResenaDto(r, c[0], c[1]);
                })
                .sorted(Comparator.comparingLong(ResenaDto::score).reversed()
                        .thenComparing(ResenaDto::createdAt, Comparator.reverseOrder()))
                .toList();
    }

    @Transactional
    public ResenaDto publicar(String idUsuario, ResenaRequest req) {
        validarXor(req.idLugar(), req.idEvento());

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Resena resena = Resena.builder()
                .usuario(usuario)
                .titulo(req.titulo())
                .contenido(req.contenido())
                .puntuacion(req.puntuacion())
                .estado(EstadoResena.VISIBLE)
                .build();

        if (StringUtils.hasText(req.idLugar())) {
            Lugar lugar = lugarRepository.findById(req.idLugar())
                    .orElseThrow(() -> new NotFoundException("Lugar no encontrado"));
            resena.setLugar(lugar);
        } else {
            Evento evento = eventoRepository.findById(req.idEvento())
                    .orElseThrow(() -> new NotFoundException("Evento no encontrado"));
            resena.setEvento(evento);
        }

        resena = resenaRepository.save(resena);
        return DtoMapper.toResenaDto(resena, 0, 0);
    }

    /** Listado completo para moderación (todos los estados). */
    @Transactional(readOnly = true)
    public List<ResenaDto> listarAdmin() {
        List<Resena> resenas = resenaRepository.findAllByOrderByCreatedAtDesc();
        Map<String, long[]> conteos = conteos(resenas);
        return resenas.stream()
                .map(r -> {
                    long[] c = conteos.getOrDefault(r.getId(), new long[]{0, 0});
                    return DtoMapper.toResenaAdminDto(r, c[0], c[1]);
                })
                .toList();
    }

    @Transactional
    public ResenaDto cambiarEstado(String idResena, EstadoResena estado) {
        Resena resena = resenaRepository.findById(idResena)
                .orElseThrow(() -> new NotFoundException("Reseña no encontrada"));
        resena.setEstado(estado);
        resena = resenaRepository.save(resena);
        long[] c = conteos(List.of(resena)).getOrDefault(resena.getId(), new long[]{0, 0});
        return DtoMapper.toResenaAdminDto(resena, c[0], c[1]);
    }

    // ---- helpers ----------------------------------------------------------

    private void validarXor(String idLugar, String idEvento) {
        boolean tieneLugar = StringUtils.hasText(idLugar);
        boolean tieneEvento = StringUtils.hasText(idEvento);
        if (tieneLugar == tieneEvento) {
            throw new BadRequestException("Debe apuntar a un lugar o a un evento (exactamente uno)");
        }
    }

    /** Mapa idResena -> [positivos, negativos]. */
    private Map<String, long[]> conteos(List<Resena> resenas) {
        if (resenas.isEmpty()) return Map.of();
        List<String> ids = resenas.stream().map(Resena::getId).toList();
        Map<String, long[]> map = new HashMap<>();
        for (Object[] fila : votoRepository.contarVotosPorResena(ids)) {
            String id = (String) fila[0];
            long pos = ((Number) fila[1]).longValue();
            long neg = ((Number) fila[2]).longValue();
            map.put(id, new long[]{pos, neg});
        }
        return map;
    }
}
