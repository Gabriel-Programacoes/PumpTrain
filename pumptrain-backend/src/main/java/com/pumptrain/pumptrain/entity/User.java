package com.pumptrain.pumptrain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100) // Coluna obrigatória, max 100 chars
    private String name;

    @Column(nullable = false, unique = true, length = 150) // Obrigatório, único, max 150 chars
    private String email; // Usaremos como 'username' para login

    @Column(nullable = false)
    private String password; // Armazenará a senha HASHED (codificada)

    @Column(nullable = false, updatable = false) // Obrigatório, não pode ser atualizado após criação
    private LocalDateTime createdAt;

    @Column
    private Integer age;

    @Column(length = 100) // Novo campo para a chave do avatar
    private String avatarKey;

    @Column
    private Integer height;
    @Column
    private Double weight;

    // --- Implementação dos Métodos da Interface UserDetails ---
    @Override
    @Transient
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    // --- Métodos de Status da Conta ---
    @Override
    @Transient // JPA ignora
    public boolean isAccountNonExpired() {
        return true; // Conta nunca expira
    }

    @Override
    @Transient // JPA ignora
    public boolean isAccountNonLocked() {
        return true; // Conta nunca bloqueada
    }

    @Override
    @Transient // JPA ignora
    public boolean isCredentialsNonExpired() {
        return true; // Senha nunca expira
    }

    @Override
    @Transient // JPA ignora
    public boolean isEnabled() {
        return true; // Conta sempre habilitada
    }

    // --- Callback do Ciclo de Vida JPA ---
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}