package com.pumptrain.pumptrain.repository;

import com.pumptrain.pumptrain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA cria a implementação deste método automaticamente!
    // Ele entende que queremos buscar um User pelo campo 'email'.
    Optional<User> findByEmail(String email);
}
