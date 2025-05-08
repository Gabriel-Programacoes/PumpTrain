package com.pumptrain.pumptrain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "achievements")
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String achievementKey; // Um identificador único textual (ex: "FIRST_WORKOUT", "10_WORKOUTS")

    @Column(nullable = false, length = 100)
    private String name; // Nome visível da conquista (ex: "Primeiro Treino!")

    @Column(nullable = false, length = 255)
    private String description; // Descrição do que fazer para ganhar

    @Column // Opcional: Caminho para um ícone
    private String iconUrl;

}