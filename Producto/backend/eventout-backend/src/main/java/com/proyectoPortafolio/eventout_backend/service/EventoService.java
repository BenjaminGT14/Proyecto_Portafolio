package com.proyectoPortafolio.eventout_backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.proyectoPortafolio.eventout_backend.dto.EventoDto;
import com.proyectoPortafolio.eventout_backend.dto.request.EventoRequest;
import com.proyectoPortafolio.eventout_backend.exception.BadRequestException;
import com.proyectoPortafolio.eventout_backend.exception.NotFoundException;
import com.proyectoPortafolio.eventout_backend.mapper.DtoMapper;
import com.proyectoPortafolio.eventout_backend.model.Evento;
import com.proyectoPortafolio.eventout_backend.model.Lugar;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.model.enums.EstadoEvento;
import com.proyectoPortafolio.eventout_backend.repository.EventoRepository;
import com.proyectoPortafolio.eventout_backend.repository.LugarRepository;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;

import jakarta.persistence.criteria.JoinType;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;
    private final LugarRepository lugarRepository;
    private final UsuarioRepository usuarioRepository;

    public EventoService(EventoRepository eventoRepository, LugarRepository lugarRepository,
                         UsuarioRepository usuarioRepository) {
        this.eventoRepository = eventoRepository;
        this.lugarRepository = lugarRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<EventoDto> listar(String comuna, String costo, String q, String desde) {
        List<Specification<Evento>> specs = new ArrayList<>();
        // Público: solo eventos aprobados.
        specs.add((root, query, cb) -> cb.equal(root.get("estado"), EstadoEvento.APROBADO));
        if (StringUtils.hasText(comuna)) {
            specs.add((root, query, cb) ->
                    cb.equal(root.join("lugar", JoinType.LEFT).get("comuna"), comuna));
        }
        if ("gratis".equalsIgnoreCase(costo)) {
            specs.add((root, query, cb) -> cb.isTrue(root.get("esGratuito")));
        } else if ("pagado".equalsIgnoreCase(costo)) {
            specs.add((root, query, cb) -> cb.isFalse(root.get("esGratuito")));
        }
        if (StringUtils.hasText(q)) {
            String needle = "%" + q.toLowerCase() + "%";
            specs.add((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("nombre")), needle),
                    cb.like(cb.lower(root.get("descripcion")), needle)));
        }
        if (StringUtils.hasText(desde)) {
            LocalDateTime desdeDt = parseDesde(desde);
            specs.add((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("fechaInicio"), desdeDt));
        }

        return eventoRepository.findAll(Specification.allOf(specs), Sort.by(Sort.Direction.ASC, "fechaInicio"))
                .stream()
                .map(DtoMapper::toEventoDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventoDto obtener(String id) {
        Evento evento = eventoRepository.findById(id)
                .filter(e -> e.getEstado() == EstadoEvento.APROBADO)
                .orElseThrow(() -> new NotFoundException("Evento no encontrado"));
        return DtoMapper.toEventoDto(evento);
    }

    /** Listado para el panel admin: todos los estados, o filtrado por uno. */
    @Transactional(readOnly = true)
    public List<EventoDto> listarAdmin(EstadoEvento estado) {
        Specification<Evento> spec = estado == null
                ? null
                : (root, query, cb) -> cb.equal(root.get("estado"), estado);
        return eventoRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(DtoMapper::toEventoDto)
                .toList();
    }

    /** Creación por admin: queda APROBADO (visible de inmediato). */
    @Transactional
    public EventoDto crear(EventoRequest req) {
        Evento evento = new Evento();
        aplicar(evento, req);
        evento.setEstado(EstadoEvento.APROBADO);
        return DtoMapper.toEventoDto(eventoRepository.save(evento));
    }

    /** Propuesta por un usuario: queda PENDIENTE hasta que un admin la apruebe. */
    @Transactional
    public EventoDto proponer(String idUsuario, EventoRequest req) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        Evento evento = new Evento();
        aplicar(evento, req);
        evento.setEstado(EstadoEvento.PENDIENTE);
        evento.setPropuestoPor(usuario);
        return DtoMapper.toEventoDto(eventoRepository.save(evento));
    }

    /** Aprobar/rechazar una propuesta (admin). */
    @Transactional
    public EventoDto cambiarEstado(String id, EstadoEvento estado) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Evento no encontrado"));
        evento.setEstado(estado);
        return DtoMapper.toEventoDto(eventoRepository.save(evento));
    }

    @Transactional
    public EventoDto actualizar(String id, EventoRequest req) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Evento no encontrado"));
        aplicar(evento, req);
        return DtoMapper.toEventoDto(eventoRepository.save(evento));
    }

    @Transactional
    public void eliminar(String id) {
        if (!eventoRepository.existsById(id)) {
            throw new NotFoundException("Evento no encontrado");
        }
        eventoRepository.deleteById(id);
    }

    private void aplicar(Evento evento, EventoRequest req) {
        evento.setNombre(req.nombre());
        evento.setDescripcion(req.descripcion());
        evento.setFechaInicio(req.fechaInicio());
        evento.setFechaFin(req.fechaFin());
        evento.setEsGratuito(req.esGratuito() != null ? req.esGratuito() : true);
        evento.setPrecio(req.precio());
        evento.setImagenUrl(req.imagenUrl());
        evento.setLugar(resolverLugar(req.idLugar()));
    }

    private Lugar resolverLugar(String idLugar) {
        if (!StringUtils.hasText(idLugar)) return null;
        return lugarRepository.findById(idLugar)
                .orElseThrow(() -> new NotFoundException("Lugar no encontrado: " + idLugar));
    }

    private LocalDateTime parseDesde(String desde) {
        try {
            return LocalDateTime.parse(desde);
        } catch (Exception ignored) {
            try {
                return LocalDate.parse(desde).atStartOfDay();
            } catch (Exception ex) {
                throw new BadRequestException("Formato de fecha 'desde' inválido: " + desde);
            }
        }
    }
}
