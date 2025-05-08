package com.pumptrain.pumptrain.controller;

import com.pumptrain.pumptrain.dto.LoginRequestDto;
import com.pumptrain.pumptrain.dto.LoginResponseDto;
import com.pumptrain.pumptrain.dto.UserRegistrationDto;
import com.pumptrain.pumptrain.entity.User;
import com.pumptrain.pumptrain.service.JwtService;
import com.pumptrain.pumptrain.service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Autowired
    public AuthController(UserService userService, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDto registrationDto) {
        // Log de entrada
        log.info("Requisição recebida para registrar novo usuário com email: {}", registrationDto.getEmail());
        // Log de debug com mais detalhes (sem a senha)
        log.debug("Dados de registro recebidos: Nome='{}', Email='{}'", registrationDto.getName(), registrationDto.getEmail());

        // Chama o serviço (exceções tratadas globalmente)
        User savedUser = userService.registerUser(registrationDto);

        // Log de sucesso
        log.info("Usuário registrado com sucesso: {}", savedUser.getEmail());
        // Retorna 201 Created
        return ResponseEntity.status(HttpStatus.CREATED).body("Usuário registrado com sucesso! ID: " + savedUser.getId());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginRequest) {
        // Log de entrada
        log.info("Requisição recebida para login do usuário: {}", loginRequest.getEmail());
        // Log de debug (sem a senha)
        log.debug("Tentativa de login para o email: {}", loginRequest.getEmail());

        // Autenticação (exceções tratadas globalmente)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwtToken = jwtService.generateToken(userDetails);

        // Log de sucesso
        log.info("Login bem-sucedido para: {}", userDetails.getUsername());
        return ResponseEntity.ok(new LoginResponseDto(jwtToken));
    }
}