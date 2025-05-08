package com.pumptrain.pumptrain.service;

import com.pumptrain.pumptrain.entity.User;
import com.pumptrain.pumptrain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;

@Slf4j
@Service
public class JpaUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    // Injeção de Dependência via Construtor
    @Autowired
    public JpaUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Este método é chamado pelo Spring Security durante a autenticação.
     * O 'username' recebido aqui será o email que o usuário digitou no login.
     */
    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        log.debug("Tentando carregar usuário pelo email: {}", usernameOrEmail);

        // Busca o usuário no banco de dados pelo email
        Optional<User> userOptional = userRepository.findByEmail(usernameOrEmail);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            log.debug("Usuário encontrado com email: {}", usernameOrEmail);
            return user; // Retorna o usuário encontrado (que implementa UserDetails)
        } else {
            log.warn("Usuário NÃO encontrado com o email: {}", usernameOrEmail);
            throw new UsernameNotFoundException("Usuário não encontrado com o email: " + usernameOrEmail);
        }
    }
}