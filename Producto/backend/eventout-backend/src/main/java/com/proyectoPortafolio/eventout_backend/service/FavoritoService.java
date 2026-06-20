package com.proyectoPortafolio.eventout_backend.service;

import java.util.Collection;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.proyectoPortafolio.eventout_backend.dto.EstadoFavoritosDto;
import com.proyectoPortafolio.eventout_backend.dto.FavoritosDto;
import com.proyectoPortafolio.eventout_backend.dto.ToggleResultDto;
import com.proyectoPortafolio.eventout_backend.dto.request.FavoritoToggleRequest;
import com.proyectoPortafolio.eventout_backend.exception.BadRequestException;
import com.proyectoPortafolio.eventout_backend.exception.NotFoundException;
import com.proyectoPortafolio.eventout_backend.mapper.DtoMapper;
import com.proyectoPortafolio.eventout_backend.model.Evento;
import com.proyectoPortafolio.eventout_backend.model.Favorito;
import com.proyectoPortafolio.eventout_backend.model.Lugar;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.repository.EventoRepository;
import com.proyectoPortafolio.eventout_backend.repository.FavoritoRepository;
import com.proyectoPortafolio.eventout_backend.repository.LugarRepository;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;

@Service
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LugarRepository lugarRepository;
    private final EventoRepository eventoRepository;

    public FavoritoService(
            FavoritoRepository favoritoRepository,
            UsuarioRepository usuarioRepository,
            LugarRepository lugarRepository,
            EventoRepository eventoRepository
    ) {
        this.favoritoRepository = favoritoRepository;
        this.usuarioRepository = usuarioRepository;
        this.lugarRepository = lugarRepository;
        this.eventoRepository = eventoRepository;
    }

    @Transactional(readOnly = true)
    public FavoritosDto listar(String idUsuario) {
        List<Lugar> lugares = favoritoRepository.findByUsuarioIdAndLugarIsNotNull(idUsuario)
                .stream().map(Favorito::getLugar).toList();
        List<Evento> eventos = favoritoRepository.findByUsuarioIdAndEventoIsNotNull(idUsuario)
                .stream().map(Favorito::getEvento).toList();
        return new FavoritosDto(
                lugares.stream().map(DtoMapper::toLugarDto).toList(),
                eventos.stream().map(DtoMapper::toEventoDto).toList());
    }

    @Transactional(readOnly = true)
    public EstadoFavoritosDto estado(String idUsuario, Collection<String> idLugares, Collection<String> idEventos) {
        List<String> lugares = (idLugares == null || idLugares.isEmpty())
                ? List.of()
                : favoritoRepository.findByUsuarioIdAndLugarIdIn(idUsuario, idLugares)
                        .stream().map(f -> f.getLugar().getId()).toList();
        List<String> eventos = (idEventos == null || idEventos.isEmpty())
                ? List.of()
                : favoritoRepository.findByUsuarioIdAndEventoIdIn(idUsuario, idEventos)
                        .stream().map(f -> f.getEvento().getId()).toList();
        return new EstadoFavoritosDto(lugares, eventos);
    }

    @Transactional
    public ToggleResultDto toggle(String idUsuario, FavoritoToggleRequest req) {
        boolean tieneLugar = StringUtils.hasText(req.idLugar());
        boolean tieneEvento = StringUtils.hasText(req.idEvento());
        if (tieneLugar == tieneEvento) {
            throw new BadRequestException("Debe ser un lugar o un evento (exactamente uno)");
        }

        Favorito existente = tieneLugar
                ? favoritoRepository.findByUsuarioIdAndLugarId(idUsuario, req.idLugar()).orElse(null)
                : favoritoRepository.findByUsuarioIdAndEventoId(idUsuario, req.idEvento()).orElse(null);

        if (existente != null) {
            favoritoRepository.delete(existente);
            return new ToggleResultDto(false);
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        Favorito favorito = Favorito.builder().usuario(usuario).build();
        if (tieneLugar) {
            favorito.setLugar(lugarRepository.findById(req.idLugar())
                    .orElseThrow(() -> new NotFoundException("Lugar no encontrado")));
        } else {
            favorito.setEvento(eventoRepository.findById(req.idEvento())
                    .orElseThrow(() -> new NotFoundException("Evento no encontrado")));
        }
        favoritoRepository.save(favorito);
        return new ToggleResultDto(true);
    }
}
