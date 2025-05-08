package com.pumptrain.pumptrain.repository;

import com.pumptrain.pumptrain.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExerciseRepository extends JpaRepository <Exercise, Long> {
    Optional<Exercise> findByNameIgnoreCase(String name);
}
