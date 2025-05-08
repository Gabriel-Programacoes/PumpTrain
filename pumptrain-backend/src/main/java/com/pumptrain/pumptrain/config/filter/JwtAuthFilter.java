package com.pumptrain.pumptrain.config.filter;

import com.pumptrain.pumptrain.service.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String path = request.getServletPath();
        log.trace("Processando filtro JWT para path: {}", path);


        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 1. Verifica se o header existe e começa com "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.trace("Nenhum cabeçalho de autenticação Bearer encontrado para {}, continuando cadeia sem autenticação JWT.", path);
            filterChain.doFilter(request, response); // Se não tiver token, continua para o próximo filtro
            return;
        }

        // 2. Extrai o token (remove o "Bearer ")
        jwt = authHeader.substring(7);
        log.trace("Token JWT extraído (parcial): {}...", jwt.length() > 10 ? jwt.substring(0, 10) : jwt);

        // 3. Extrai o email (subject) do token usando o JwtService
        try {
            userEmail = jwtService.extractUsername(jwt);
            log.trace("Email extraído do JWT: {}", userEmail);
        } catch (ExpiredJwtException e) {
            // Log WARN para token expirado (comum)
            log.warn("Token JWT expirado: {} - Path: {}", e.getMessage(), path);
            // Considerar enviar 401 aqui ou deixar o Spring Security tratar mais tarde
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Token expirado\"}");
            response.setContentType("application/json");
            return; // Sai do método se quiser barrar imediatamente
        } catch (JwtException e) {
            // Log WARN para outros erros de JWT (assinatura inválida, malformado, etc.)
            log.warn("Erro de validação JWT: {} - Path: {}", e.getMessage(), path);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Token inválido\"}");
            response.setContentType("application/json");
            return; // Sai do método se quiser barrar imediatamente
        } catch (Exception e) {
            log.error("Erro inesperado ao extrair username do JWT para path {}: ", path, e);
            // Deixar a cadeia continuar pode resultar em erro 500 ou acesso não autorizado posterior
            filterChain.doFilter(request, response);
            return;
        }


        // 4. Verifica se o usuário já NÃO está autenticado no contexto atual
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            log.trace("Email {} extraído, verificando autenticação no contexto (atual é nula).", userEmail);
            // 5. Carrega os UserDetails do banco usando nosso UserDetailsService
            // Nota: Se o usuário foi deletado após a emissão do token, loadUserByUsername lançará UsernameNotFoundException
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 6. Valida o token (compara username e verifica expiração - expiração já verificada acima, mas o método faz de novo)
            if (jwtService.isTokenValid(jwt, userDetails)) {
                // 7. Se o token for válido, cria um objeto Authentication
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, // O principal (nosso objeto User)
                        null,        // Credenciais (não necessárias aqui, já validamos pelo token)
                        userDetails.getAuthorities() // As permissões/roles
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 8. ATUALIZA o SecurityContextHolder com a nova autenticação
                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.debug("Usuário '{}' autenticado com sucesso via JWT para o path: {}", userEmail, path);
            } else {
                log.warn("Token JWT considerado inválido para usuário '{}' no path: {}", userEmail, path);
            }
        } else {
            log.trace("Não é necessário autenticar via JWT: Email nulo ({}) ou contexto já possui autenticação ({})",
                    userEmail == null, SecurityContextHolder.getContext().getAuthentication() != null);
        }

        // 9. Passa a requisição e a resposta para o próximo filtro na cadeia
        filterChain.doFilter(request, response);
    }
}