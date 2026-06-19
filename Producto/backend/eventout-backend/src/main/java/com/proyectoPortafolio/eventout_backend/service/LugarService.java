package com.proyectoPortafolio.eventout_backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.proyectoPortafolio.eventout_backend.dto.LugarDto;
import com.proyectoPortafolio.eventout_backend.dto.request.LugarRequest;
import com.proyectoPortafolio.eventout_backend.exception.NotFoundException;
import com.proyectoPortafolio.eventout_backend.mapper.DtoMapper;
import com.proyectoPortafolio.eventout_backend.model.Categoria;
import com.proyectoPortafolio.eventout_backend.model.Lugar;
import com.proyectoPortafolio.eventout_backend.repository.CategoriaRepository;
import com.proyectoPortafolio.eventout_backend.repository.LugarRepository;

@Service
public class LugarService {

    private final LugarRepository lugarRepository;
    private final CategoriaRepository categoriaRepository;

    public LugarService(LugarRepository lugarRepository, CategoriaRepository categoriaRepository) {
        this.lugarRepository = lugarRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<LugarDto> listar(String idCategoria, String comuna, String costo, String q) {
        List<Specification<Lugar>> specs = new ArrayList<>();
        if (StringUtils.hasText(idCategoria)) {
            specs.add((root, query, cb) -> cb.equal(root.get("categoria").get("id"), idCategoria));
        }
        if (StringUtils.hasText(comuna)) {
            specs.add((root, query, cb) -> cb.equal(root.get("comuna"), comuna));
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

        return lugarRepository.findAll(Specification.allOf(specs), Sort.by(Sort.Direction.ASC, "nombre"))
                .stream()
                .map(DtoMapper::toLugarDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public LugarDto obtener(String id) {
        Lugar lugar = lugarRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Lugar no encontrado"));
        return DtoMapper.toLugarDto(lugar);
    }

    @Transactional
    public LugarDto crear(LugarRequest req) {
        Lugar lugar = new Lugar();
        aplicar(lugar, req);
        return DtoMapper.toLugarDto(lugarRepository.save(lugar));
    }

    @Transactional
    public LugarDto actualizar(String id, LugarRequest req) {
        Lugar lugar = lugarRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Lugar no encontrado"));
        aplicar(lugar, req);
        return DtoMapper.toLugarDto(lugarRepository.save(lugar));
    }

    @Transactional
    public void eliminar(String id) {
        if (!lugarRepository.existsById(id)) {
            throw new NotFoundException("Lugar no encontrado");
        }
        lugarRepository.deleteById(id);
    }

    private void aplicar(Lugar lugar, LugarRequest req) {
        lugar.setNombre(req.nombre());
        lugar.setDescripcion(req.descripcion());
        lugar.setDireccion(req.direccion());
        lugar.setComuna(req.comuna());
        lugar.setEsGratuito(req.esGratuito() != null ? req.esGratuito() : true);
        lugar.setPrecio(req.precio());
        lugar.setHorario(req.horario());
        lugar.setLatitud(req.latitud());
        lugar.setLongitud(req.longitud());
        lugar.setImagenUrl(req.imagenUrl());
        lugar.setWikipediaSlug(req.wikipediaSlug());
        lugar.setCategoria(resolverCategoria(req.idCategoria()));
    }

    private Categoria resolverCategoria(String idCategoria) {
        if (!StringUtils.hasText(idCategoria)) return null;
        return categoriaRepository.findById(idCategoria)
                .orElseThrow(() -> new NotFoundException("Categoría no encontrada: " + idCategoria));
    }
}
