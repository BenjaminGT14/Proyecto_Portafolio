# syntax=docker/dockerfile:1

# ============================================================
# Etapa 1 (build): compila el proyecto y genera el .jar con Maven.
# Usamos una imagen que ya trae Maven + JDK 21, asi no instalamos nada.
# ============================================================
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copiamos primero el pom para aprovechar la cache de Docker: si no cambian
# las dependencias, no se vuelven a descargar en cada build.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
# -DskipTests: los tests necesitan base de datos; los saltamos en el build.
RUN mvn -B clean package -DskipTests

# ============================================================
# Etapa 2 (runtime): imagen final, liviana. Solo lleva el JRE y el .jar.
# El codigo fuente y Maven se quedan en la etapa anterior (no van a produccion).
# ============================================================
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copia el jar ejecutable generado en la etapa de build (el que NO termina en .original).
COPY --from=build /app/target/*.jar app.jar

# Spring Boot escucha en 8080 por defecto.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
