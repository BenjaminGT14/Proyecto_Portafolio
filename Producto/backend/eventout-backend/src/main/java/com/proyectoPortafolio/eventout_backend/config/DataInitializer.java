package com.proyectoPortafolio.eventout_backend.config;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.proyectoPortafolio.eventout_backend.model.Categoria;
import com.proyectoPortafolio.eventout_backend.model.Evento;
import com.proyectoPortafolio.eventout_backend.model.Lugar;
import com.proyectoPortafolio.eventout_backend.model.Resena;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.model.VotoResena;
import com.proyectoPortafolio.eventout_backend.model.enums.EstadoEvento;
import com.proyectoPortafolio.eventout_backend.model.enums.EstadoResena;
import com.proyectoPortafolio.eventout_backend.model.enums.EstadoUsuario;
import com.proyectoPortafolio.eventout_backend.model.enums.Rol;
import com.proyectoPortafolio.eventout_backend.repository.CategoriaRepository;
import com.proyectoPortafolio.eventout_backend.repository.EventoRepository;
import com.proyectoPortafolio.eventout_backend.repository.LugarRepository;
import com.proyectoPortafolio.eventout_backend.repository.ResenaRepository;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;
import com.proyectoPortafolio.eventout_backend.repository.VotoResenaRepository;

/**
 * Siembra los datos iniciales (los mismos que el frontend usaba como mock)
 * la primera vez que arranca la app contra una BD vacía. Las contraseñas se
 * cifran con BCrypt. Idempotente: cada bloque solo corre si su tabla está vacía.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoriaRepository categoriaRepository;
    private final LugarRepository lugarRepository;
    private final EventoRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ResenaRepository resenaRepository;
    private final VotoResenaRepository votoRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            CategoriaRepository categoriaRepository,
            LugarRepository lugarRepository,
            EventoRepository eventoRepository,
            UsuarioRepository usuarioRepository,
            ResenaRepository resenaRepository,
            VotoResenaRepository votoRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.categoriaRepository = categoriaRepository;
        this.lugarRepository = lugarRepository;
        this.eventoRepository = eventoRepository;
        this.usuarioRepository = usuarioRepository;
        this.resenaRepository = resenaRepository;
        this.votoRepository = votoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedCategorias();
        seedUsuarios();
        seedLugares();
        seedEventos();
        seedResenasYVotos();
        backfillEstadoEventos();
        backfillEstadoUsuarios();
    }

    /**
     * Las cuentas creadas antes de existir la columna `estado` quedan en NULL tras
     * el ALTER de Hibernate. Las marcamos como ACTIVO. Idempotente.
     */
    private void backfillEstadoUsuarios() {
        List<Usuario> sinEstado = usuarioRepository.findAll().stream()
                .filter(u -> u.getEstado() == null)
                .peek(u -> u.setEstado(EstadoUsuario.ACTIVO))
                .toList();
        if (!sinEstado.isEmpty()) {
            usuarioRepository.saveAll(sinEstado);
            log.info("[DataInitializer] Backfill estado=ACTIVO en {} usuarios", sinEstado.size());
        }
    }

    /**
     * Los eventos creados antes de existir la columna `estado` quedan en NULL tras
     * el ALTER de Hibernate. Los marcamos como APROBADO (eran públicos). Idempotente.
     */
    private void backfillEstadoEventos() {
        List<Evento> sinEstado = eventoRepository.findAll().stream()
                .filter(e -> e.getEstado() == null)
                .peek(e -> e.setEstado(EstadoEvento.APROBADO))
                .toList();
        if (!sinEstado.isEmpty()) {
            eventoRepository.saveAll(sinEstado);
            log.info("[DataInitializer] Backfill estado=APROBADO en {} eventos", sinEstado.size());
        }
    }

    // ---- categorías -------------------------------------------------------
    private void seedCategorias() {
        if (categoriaRepository.count() > 0) return;
        categoriaRepository.saveAll(List.of(
                new Categoria("cat-parque", "Parques y naturaleza", "trees"),
                new Categoria("cat-museo", "Museos", "landmark"),
                new Categoria("cat-teatro", "Teatros", "drama"),
                new Categoria("cat-historico", "Sitios históricos", "building-2"),
                new Categoria("cat-comunitario", "Actividades comunitarias", "users"),
                new Categoria("cat-iglesia", "Iglesias y patrimonio", "church")
        ));
        log.info("[DataInitializer] Categorías sembradas");
    }

    // ---- usuarios ---------------------------------------------------------
    private void seedUsuarios() {
        if (usuarioRepository.count() > 0) return;
        usuarioRepository.saveAll(List.of(
                usuario("u-admin", "Administrador", "admin@eventout.cl", "admin1234", Rol.ADMIN),
                usuario("u-andrea", "Andrea Valdés", "andrea@eventout.cl", "demo1234", Rol.USER),
                usuario("u-ricardo", "Ricardo Soto", "ricardo@eventout.cl", "demo1234", Rol.USER),
                usuario("u-elena", "Elena Rojas", "elena@eventout.cl", "demo1234", Rol.USER),
                usuario("u-matias", "Matías Pizarro", "matias@eventout.cl", "demo1234", Rol.USER),
                usuario("u-camila", "Camila Bravo", "camila@eventout.cl", "demo1234", Rol.USER)
        ));
        log.info("[DataInitializer] Usuarios sembrados (admin: admin@eventout.cl / admin1234)");
    }

    private Usuario usuario(String id, String nombre, String email, String rawPassword, Rol rol) {
        return Usuario.builder()
                .id(id)
                .nombre(nombre)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .avatarUrl(avatar(nombre))
                .rol(rol)
                .build();
    }

    private String avatar(String nombre) {
        return "https://api.dicebear.com/9.x/initials/svg?seed="
                + URLEncoder.encode(nombre, StandardCharsets.UTF_8)
                + "&backgroundColor=c04f23&textColor=ffffff&radius=50";
    }

    // ---- lugares ----------------------------------------------------------
    private void seedLugares() {
        if (lugarRepository.count() > 0) return;
        Map<String, Categoria> cats = categoriaRepository.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(Categoria::getId, c -> c));

        lugarRepository.saveAll(List.of(
                lugar("lugar-1", cats.get("cat-parque"), "Parque Metropolitano de Santiago",
                        "Parque urbano formado por los cerros San Cristóbal, Chacarillas, Los Gemelos, Pirámide, Polanco y El Carbón. Con más de 750 hectáreas entre Huechuraba, Providencia, Recoleta y Vitacura, es el parque urbano más extenso de Sudamérica y el cuarto más grande del mundo.",
                        "Pío Nono 450", "Recoleta", -33.42369167, -70.63261111, true, "Lun a Dom 08:30 - 20:00",
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/J25_317_Cerro_San_Crist%C3%B3bal.jpg/1280px-J25_317_Cerro_San_Crist%C3%B3bal.jpg",
                        "Parque_Metropolitano_de_Santiago"),
                lugar("lugar-2", cats.get("cat-museo"), "Museo Nacional de Bellas Artes",
                        "Uno de los principales centros de difusión de las artes visuales en Chile. Fundado el 18 de septiembre de 1880 como Museo Nacional de Pinturas, es el primer museo de arte de Latinoamérica.",
                        "José Miguel de la Barra 650", "Santiago", -33.435322, -70.643569, true, "Mar a Dom 10:00 - 18:50",
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Museo_Nacional_de_Bellas_Artes%2C_Santiago_20230311.jpg/1280px-Museo_Nacional_de_Bellas_Artes%2C_Santiago_20230311.jpg",
                        "Museo_Nacional_de_Bellas_Artes_de_Chile"),
                lugar("lugar-3", cats.get("cat-teatro"), "Teatro Municipal de Santiago",
                        "Ubicado en el centro de Santiago, su construcción comenzó en 1853 y fue inaugurado el 17 de septiembre de 1857 con la ópera Ernani de Giuseppe Verdi. Principal teatro de ópera de Chile.",
                        "Agustinas 794", "Santiago", -33.44083333, -70.6475, false, "Según programación",
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Teatro_Municipal%2C_Santiago_20230521_01.jpg/1280px-Teatro_Municipal%2C_Santiago_20230521_01.jpg",
                        "Teatro_Municipal_de_Santiago"),
                lugar("lugar-4", cats.get("cat-parque"), "Cerro Santa Lucía",
                        "Antiguamente llamado cerro Huelén en picunche, es un parque urbano ubicado en el corazón de Santiago. Cuenta con fortificaciones del siglo XIX, jardines y miradores con vista a la ciudad.",
                        "Av. Libertador Bernardo O'Higgins", "Santiago", -33.44027778, -70.64416667, true, "Lun a Dom 09:00 - 19:00",
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Vista_lateral_Cerro_Santa_Lucia.jpg/1280px-Vista_lateral_Cerro_Santa_Lucia.jpg",
                        "Cerro_Santa_Luc%C3%ADa"),
                lugar("lugar-5", cats.get("cat-historico"), "Palacio de La Moneda",
                        "Sede del Gobierno de Chile y residencia oficial del presidente de la República. Visitas guiadas, cambio de guardia y Centro Cultural La Moneda en su subterráneo.",
                        "Moneda S/N", "Santiago", -33.443018, -70.65387, true, "Acceso público a Plaza de la Constitución",
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Palacio_de_La_Moneda_-_miguelreflex.jpg/1280px-Palacio_de_La_Moneda_-_miguelreflex.jpg",
                        "Palacio_de_La_Moneda"),
                lugar("lugar-6", cats.get("cat-museo"), "Museo de la Memoria y los Derechos Humanos",
                        "Museo público dedicado a conmemorar a las víctimas de violaciones a los Derechos Humanos durante la dictadura militar de Augusto Pinochet (1973-1990). Ubicado frente a la estación de Metro Quinta Normal.",
                        "Matucana 501", "Santiago", -33.43983889, -70.679375, true, "Mar a Dom 10:00 - 18:00",
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Museo_de_la_Memoria_y_los_Derechos_Humanos.jpg/1280px-Museo_de_la_Memoria_y_los_Derechos_Humanos.jpg",
                        "Museo_de_la_Memoria_y_los_Derechos_Humanos"),
                lugar("lugar-7", cats.get("cat-iglesia"), "Catedral Metropolitana de Santiago",
                        "Sede de la arquidiócesis de Santiago de Chile y principal templo de la Iglesia católica en el país. Ubicada en la Plaza de Armas, en pleno centro histórico.",
                        "Plaza de Armas S/N", "Santiago", -33.43765833, -70.65180556, true, "Lun a Dom 09:00 - 19:00",
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Catedral_de_Santiago.tif/lossy-page1-1280px-Catedral_de_Santiago.tif.jpg",
                        "Catedral_Metropolitana_de_Santiago"),
                lugar("lugar-8", cats.get("cat-parque"), "Parque Bicentenario",
                        "Parque público de 30 hectáreas situado en Vitacura, contenido por la Avenida Bicentenario y el río Mapocho. Conocido por sus lagunas con flamencos y áreas verdes.",
                        "Av. Bicentenario 3800", "Vitacura", -33.39988611, -70.60213611, true, "Lun a Dom 07:00 - 22:00",
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Parque_Bicentenario%2C_Vitacura%2C_Santiago_20200314_02.jpg/1280px-Parque_Bicentenario%2C_Vitacura%2C_Santiago_20200314_02.jpg",
                        "Parque_Bicentenario_(Vitacura)")
        ));
        log.info("[DataInitializer] Lugares sembrados");
    }

    private Lugar lugar(String id, Categoria categoria, String nombre, String descripcion, String direccion,
                        String comuna, double lat, double lng, boolean gratuito, String horario,
                        String imagenUrl, String wikipediaSlug) {
        return Lugar.builder()
                .id(id).categoria(categoria).nombre(nombre).descripcion(descripcion)
                .direccion(direccion).comuna(comuna).latitud(lat).longitud(lng)
                .esGratuito(gratuito).horario(horario).imagenUrl(imagenUrl).wikipediaSlug(wikipediaSlug)
                .build();
    }

    // ---- eventos ----------------------------------------------------------
    private void seedEventos() {
        if (eventoRepository.count() > 0) return;
        Map<String, Lugar> lugares = lugarRepository.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(Lugar::getId, l -> l));

        eventoRepository.saveAll(List.of(
                evento("evento-1", lugares.get("lugar-3"), "Ópera Carmen — Temporada 2026",
                        "La famosa ópera de Bizet en el Teatro Municipal. 4 funciones en julio.",
                        ldt("2026-07-17T20:00:00"), ldt("2026-07-17T23:00:00"), false, 35000.0,
                        "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800"),
                evento("evento-2", lugares.get("lugar-1"), "Yoga al aire libre en el San Cristóbal",
                        "Clase gratuita de yoga al amanecer en la cumbre del cerro.",
                        ldt("2026-07-11T07:30:00"), ldt("2026-07-11T08:30:00"), true, 0.0,
                        "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800"),
                evento("evento-3", lugares.get("lugar-2"), "Exposición: Arte Contemporáneo Chileno",
                        "Muestra colectiva de 12 artistas chilenos contemporáneos.",
                        ldt("2026-07-01T10:00:00"), ldt("2026-08-30T18:00:00"), true, 0.0,
                        "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=800"),
                evento("evento-4", lugares.get("lugar-6"), "Conversatorio: Memoria y Democracia",
                        "Mesa redonda con historiadores y activistas.",
                        ldt("2026-07-22T18:30:00"), ldt("2026-07-22T20:30:00"), true, 0.0,
                        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800"),
                evento("evento-5", lugares.get("lugar-8"), "Feria de Emprendedores Bicentenario",
                        "Más de 80 emprendedores locales con productos artesanales y gastronomía.",
                        ldt("2026-07-26T11:00:00"), ldt("2026-07-26T19:00:00"), true, 0.0,
                        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800")
        ));
        log.info("[DataInitializer] Eventos sembrados");
    }

    private Evento evento(String id, Lugar lugar, String nombre, String descripcion,
                          LocalDateTime inicio, LocalDateTime fin, boolean gratuito, Double precio, String imagenUrl) {
        return Evento.builder()
                .id(id).lugar(lugar).nombre(nombre).descripcion(descripcion)
                .fechaInicio(inicio).fechaFin(fin).esGratuito(gratuito).precio(precio).imagenUrl(imagenUrl)
                .build();
    }

    // ---- reseñas y votos --------------------------------------------------
    private void seedResenasYVotos() {
        if (resenaRepository.count() > 0) return;
        Map<String, Usuario> u = usuarioRepository.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(Usuario::getId, x -> x));
        Map<String, Lugar> l = lugarRepository.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(Lugar::getId, x -> x));
        Map<String, Evento> e = eventoRepository.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(Evento::getId, x -> x));

        Resena r1 = resenaLugar("r-1", u.get("u-andrea"), l.get("lugar-2"), "Imperdible los domingos",
                "El Museo de Bellas Artes es increíble los domingos, la entrada gratuita es un gran beneficio. Muy recomendado para ir en familia.",
                5, "2026-05-24T14:20:00-03:00");
        Resena r2 = resenaLugar("r-2", u.get("u-ricardo"), l.get("lugar-4"), "Buen panorama gratis",
                "Fui al Cerro Santa Lucía el sábado pasado. Un poco lleno pero ideal para desconectarse de la ciudad. Traigan protector solar.",
                4, "2026-05-21T11:00:00-03:00");
        Resena r3 = resenaEvento("r-3", u.get("u-elena"), e.get("evento-1"), "Producción de primer nivel",
                "La ópera estuvo impecable. Muy buena acústica del Municipal y la dirección de orquesta superlativa.",
                5, "2026-05-25T22:00:00-03:00");
        Resena r4 = resenaLugar("r-4", u.get("u-matias"), l.get("lugar-1"), "Mejor temprano",
                "El cerro San Cristóbal vale toda la pena, pero suban temprano para evitar las filas del funicular y el calor.",
                4, "2026-05-22T09:00:00-03:00");
        Resena r5 = resenaEvento("r-5", u.get("u-camila"), e.get("evento-2"), "Una experiencia única",
                "Yoga al amanecer con vista a Santiago. Pocas cosas pueden compararse con esto. Llegar 15 min antes para alcanzar buen lugar.",
                5, "2026-05-23T07:45:00-03:00");
        Resena r6 = resenaLugar("r-6", u.get("u-andrea"), l.get("lugar-5"), "Visita guiada recomendable",
                "El cambio de guardia es protocolar y vistoso. El Centro Cultural bajo La Moneda tiene siempre exposiciones interesantes.",
                4, "2026-05-20T17:30:00-03:00");

        // save() con id asignado hace merge y devuelve la instancia gestionada;
        // reasignamos para que los votos referencien esas instancias.
        r1 = resenaRepository.save(r1);
        r2 = resenaRepository.save(r2);
        r3 = resenaRepository.save(r3);
        r4 = resenaRepository.save(r4);
        r5 = resenaRepository.save(r5);
        r6 = resenaRepository.save(r6);

        votoRepository.saveAll(List.of(
                voto("v-1", u.get("u-elena"), r1, true),
                voto("v-2", u.get("u-matias"), r1, true),
                voto("v-3", u.get("u-camila"), r1, true),
                voto("v-4", u.get("u-andrea"), r3, true),
                voto("v-5", u.get("u-matias"), r3, true),
                voto("v-6", u.get("u-andrea"), r2, true),
                voto("v-7", u.get("u-ricardo"), r5, true),
                voto("v-8", u.get("u-elena"), r5, true),
                voto("v-9", u.get("u-camila"), r4, false)
        ));
        log.info("[DataInitializer] Reseñas y votos sembrados");
    }

    private Resena resenaLugar(String id, Usuario autor, Lugar lugar, String titulo, String contenido,
                               int puntuacion, String createdAtIso) {
        return Resena.builder()
                .id(id).usuario(autor).lugar(lugar).titulo(titulo).contenido(contenido)
                .puntuacion(puntuacion).estado(EstadoResena.VISIBLE)
                .createdAt(OffsetDateTime.parse(createdAtIso).toInstant())
                .build();
    }

    private Resena resenaEvento(String id, Usuario autor, Evento evento, String titulo, String contenido,
                                int puntuacion, String createdAtIso) {
        return Resena.builder()
                .id(id).usuario(autor).evento(evento).titulo(titulo).contenido(contenido)
                .puntuacion(puntuacion).estado(EstadoResena.VISIBLE)
                .createdAt(OffsetDateTime.parse(createdAtIso).toInstant())
                .build();
    }

    private VotoResena voto(String id, Usuario usuario, Resena resena, boolean positivo) {
        return VotoResena.builder().id(id).usuario(usuario).resena(resena).esPositivo(positivo).build();
    }

    private LocalDateTime ldt(String iso) {
        return LocalDateTime.parse(iso);
    }
}
