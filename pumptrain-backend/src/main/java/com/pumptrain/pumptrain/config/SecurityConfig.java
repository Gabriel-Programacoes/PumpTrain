package com.pumptrain.pumptrain.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import com.pumptrain.pumptrain.config.filter.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// Imports para CORS
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import static org.springframework.security.config.Customizer.withDefaults;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Autowired
    public SecurityConfig(JwtAuthFilter jwtAuthFilter, UserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(withDefaults())

                .csrf(csrf -> csrf.disable())

                // Configura autorização de requisições
                .authorizeHttpRequests(auth -> auth
                        // ... (permissões existentes para /auth, /api/exercises, /h2-console, /swagger-ui) ...
                        .requestMatchers(HttpMethod.GET, "/api/exercises/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/user/profile").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/user/achievements").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/workouts/today").authenticated()


                        .requestMatchers(HttpMethod.PUT, "/api/workouts/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/user/profile").authenticated()

                        .requestMatchers(HttpMethod.POST, "/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/exercises").authenticated()
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/user/stats").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/workouts/*/complete").authenticated() // Usar * ou ** para o ID


                        // ApiClient cuida de deletar o Workout/Treino, por isso a não presença do DELETE aqui
                        .requestMatchers(HttpMethod.DELETE, "/api/exercises").authenticated()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()
                        // --- Qualquer outra requisição exige autenticação ---
                        .anyRequest().authenticated()
                )

                // Configura gerenciamento de sessão como STATELESS
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Configura o AuthenticationProvider
                .authenticationProvider(authenticationProvider())

                // Adiciona o filtro JWT ANTES do filtro padrão
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                // Mantém configuração para H2 Console
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.sameOrigin())
                );

        return http.build();
    }


    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // --- Origens Permitidas ---
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5175", // Exemplo: React/Vue/Angular padrão
                "http://127.0.0.1:3000",
                "http://localhost:5173" , // Exemplo: Vite padrão
                "http://localhost:5174"
                // Adicionar a URL do frontend em produção aqui! Ex: "https://meuapp.com"
        ));

        // --- Métodos HTTP Permitidos ---
        // Permitir os métodos que sua API usa. "*" permite todos.
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));

        // --- Cabeçalhos Permitidos ---
        // Permitir cabeçalhos comuns e o cabeçalho de Autorização para JWT. "*" permite todos.
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Cache-Control",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With"
                // Adicionar outros cabeçalhos customizados se o frontend enviar
        ));

        // --- Permitir Credenciais ---
        configuration.setAllowCredentials(true);

        // --- Tempo Máximo Cache Preflight (Opcional) ---
        // Quanto tempo o navegador pode cachear a resposta da requisição OPTIONS (preflight).
        configuration.setMaxAge(3600L); // 1 hora

        // Aplica a configuração a todos os paths da API
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // "/**" aplica a todos os endpoints

        return source;
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

}