package com.proyectoPortafolio.eventout_backend.service;

import java.util.Collection;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectoPortafolio.eventout_backend.dto.VotoDto;
import com.proyectoPortafolio.eventout_backend.dto.request.VotoRequest;
import com.proyectoPortafolio.eventout_backend.exception.NotFoundException;
import com.proyectoPortafolio.eventout_backend.mapper.DtoMapper;
import com.proyectoPortafolio.eventout_backend.model.Resena;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.model.VotoResena;
import com.proyectoPortafolio.eventout_backend.repository.ResenaRepository;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;
import com.proyectoPortafolio.eventout_backend.repository.VotoResenaRepository;

@Service
public class VotoService {

    private final VotoResenaRepository votoRepository;
    private final ResenaRepository resenaRepository;
    private final UsuarioRepository usuarioRepository;

    public VotoService(
            VotoResenaRepository votoRepository,
            ResenaRepository resenaRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.votoRepository = votoRepository;
        this.resenaRepository = resenaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Registra/actualiza el voto. Si el usuario vuelve a votar lo mismo, se
     * elimina (toggle) y se devuelve null, replicando el comportamiento previo.
     */
    @Transactional
    public VotoDto votar(String idUsuario, VotoRequest req) {
        VotoResena existente = votoRepository
                .findByUsuarioIdAndResenaId(idUsuario, req.idResena())
                .orElse(null);

        if (existente != null) {
            if (existente.getEsPositivo().equals(req.esPositivo())) {
                votoRepository.delete(existente);
                return null;
            }
            existente.setEsPositivo(req.esPositivo());
            return DtoMapper.toVotoDto(votoRepository.save(existente));
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        Resena resena = resenaRepository.findById(req.idResena())
                .orElseThrow(() -> new NotFoundException("Reseña no encontrada"));

        VotoResena voto = VotoResena.builder()
                .usuario(usuario)
                .resena(resena)
                .esPositivo(req.esPositivo())
                .build();
        return DtoMapper.toVotoDto(votoRepository.save(voto));
    }

    @Transactional(readOnly = true)
    public List<VotoDto> votosDelUsuario(String idUsuario, Collection<String> idsResenas) {
        if (idsResenas == null || idsResenas.isEmpty()) return List.of();
        return votoRepository.findByUsuarioIdAndResenaIdIn(idUsuario, idsResenas)
                .stream()
                .map(DtoMapper::toVotoDto)
                .toList();
    }
}
