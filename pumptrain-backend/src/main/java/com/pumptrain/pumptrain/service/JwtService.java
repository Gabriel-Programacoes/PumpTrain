package com.pumptrain.pumptrain.service;

import com.pumptrain.pumptrain.config.properties.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Service
public class JwtService {
    private final JwtProperties jwtProperties;
    private final SecretKey key;

    @Autowired
    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        // NÃO LOGAR O SEGREDO BRUTO OU keyBytes!
        log.info("JwtService inicializado.");
        log.debug("Configuração JWT: Duração da expiração = {} ms", jwtProperties.getExpirationMs());
        // Decodifica a chave secreta Base64 (ou usa diretamente se não for Base64)
        byte[] keyBytes = jwtProperties.getSecret().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        // Validar o tamanho da chave para HMAC-SHA256 (deve ter pelo menos 256 bits / 32 bytes)
        if (keyBytes.length < 32) {
            log.error("ERRO CRÍTICO: A chave secreta JWT configurada é muito curta para HS256! Deve ter pelo menos 32 bytes.");
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        log.debug("Chave HMAC-SHA para JWT gerada com sucesso.");
    }

    /** Extrai o username (subject) do token. */
    public String extractUsername(String token) {
        log.trace("Extraindo username (subject) do token.");
        // Lança exceções (ExpiredJwtException, SignatureException etc.) se o token for inválido/expirado
        // Essas exceções são geralmente tratadas no filtro (JwtAuthFilter)
        return extractClaim(token, Claims::getSubject);
    }

    /** Extrai uma claim específica usando uma função resolver. */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        log.trace("Extraindo claim específica do token.");
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /** Gera um token JWT para o usuário. */
    public String generateToken(UserDetails userDetails) {
        log.debug("Gerando token JWT para usuário: {}", userDetails.getUsername());
        return generateToken(new HashMap<>(), userDetails); // Chama a sobrecarga com claims extras vazias
    }

    /** Gera um token JWT com claims extras. */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        String username = userDetails.getUsername();
        log.debug("Iniciando geração de token para: {} com claims extras: {}", username, extraClaims.keySet());

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getExpirationMs());
        log.debug("Token para {} terá expiração em: {}", username, expiryDate);

        String token = Jwts.builder()
                .claims(extraClaims)            // Adiciona claims extras (se houver)
                .subject(username)              // Define o 'subject' como o email/username
                .issuedAt(now)                  // Define a data de emissão
                .expiration(expiryDate)         // Define a data de expiração
                .signWith(key, Jwts.SIG.HS256)  // Assina com a chave e algoritmo HS256
                .compact();                     // Constrói o token compacto (String)

        log.info("Token JWT gerado com sucesso para usuário: {}", username);
        // NÃO LOGAR O TOKEN COMPLETO AQUI, exceto talvez em TRACE e com ressalvas
        log.trace("Token gerado (parcial) para {}: {}...", username, token.length() > 10 ? token.substring(0, 10) : token);
        return token;
    }

    /** Verifica se o token é válido para o usuário (username confere e não expirou). */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        log.trace("Validando token para usuário: {}", userDetails.getUsername());
        String usernameFromToken = null;
        boolean isUsernameMatch = false;
        boolean isTokenNonExpired = false;

        try {
            usernameFromToken = extractUsername(token);
            isUsernameMatch = usernameFromToken.equals(userDetails.getUsername());
            if (!isUsernameMatch) {
                log.warn("Validação falhou: Username do token ({}) não corresponde ao UserDetails ({}).", usernameFromToken, userDetails.getUsername());
                return false; // Retorna falso imediatamente se o username não bate
            }

            isTokenNonExpired = !isTokenExpired(token);
            if (!isTokenNonExpired) {
                log.warn("Validação falhou: Token para {} expirou.", usernameFromToken);
                return false; // Retorna falso imediatamente se expirou
            }

            // Se chegou aqui, username bate e não expirou
            log.debug("Token JWT validado com sucesso para usuário: {}", userDetails.getUsername());
            return true;

        } catch (ExpiredJwtException e) {
            log.warn("Validação falhou: Token expirado para usuário {} (Exceção: {})", userDetails.getUsername(), e.getMessage());
            return false;
        } catch (JwtException e) { // Pega outras exceções JWT (assinatura inválida, malformado, etc.)
            log.warn("Validação falhou: Token inválido para usuário {} (Exceção: {})", userDetails.getUsername(), e.getMessage());
            return false;
        } catch (Exception e) { // Pega qualquer outra exceção inesperada
            log.error("Erro inesperado durante a validação do token para usuário {}: ", userDetails.getUsername(), e);
            return false;
        }
    }

    /** Verifica se o token expirou (privado). */
    private boolean isTokenExpired(String token) {
        log.trace("Verificando expiração do token.");
        Date expiration = extractExpiration(token);
        boolean expired = expiration.before(new Date());
        log.trace("Token expirado? {}", expired);
        return expired;
        // Não precisa de try-catch aqui se extractExpiration já trata
    }

    /** Extrai a data de expiração (privado). */
    private Date extractExpiration(String token) {
        log.trace("Extraindo data de expiração do token.");
        return extractClaim(token, Claims::getExpiration);
    }

    /** Extrai todas as claims do token (privado). Lança exceções se inválido/expirado. */
    private Claims extractAllClaims(String token) {
        log.trace("Extraindo todas as claims do token.");
        // Este método lançará exceções como ExpiredJwtException, SignatureException, MalformedJwtException, etc.
        // que serão capturadas nos métodos públicos que o chamam (ex: isTokenValid, extractUsername).
        return Jwts.parser()
                .verifyWith(key) // Verifica a assinatura usando a chave
                .build()
                .parseSignedClaims(token) // Faz o parse e valida (lança exceção se falhar)
                .getPayload(); // Retorna o corpo (claims)
    }
}