package com.pumptrain.pumptrain.entity;

import com.pumptrain.pumptrain.entity.enums.ExerciseType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "exercises")

public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, length = 50)
    private String muscleGroup;

    @Column(length = 200)
    private String equipment;

    @Enumerated(EnumType.STRING)
    @Column(name= "EXERCISE_TYPE", nullable = true, length = 20)
    private ExerciseType exerciseType;

    public Exercise(Object id, String name, String description, String muscleGroup, String equipment, ExerciseType exerciseType) {

    }
}
