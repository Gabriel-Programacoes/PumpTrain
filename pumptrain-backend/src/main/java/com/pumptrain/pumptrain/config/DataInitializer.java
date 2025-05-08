package com.pumptrain.pumptrain.config;

import com.pumptrain.pumptrain.entity.Exercise;
import com.pumptrain.pumptrain.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.pumptrain.pumptrain.entity.Achievement;
import com.pumptrain.pumptrain.repository.AchievementRepository;

import java.util.Arrays;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class DataInitializer implements CommandLineRunner {

    private final ExerciseRepository exerciseRepository;
    private final AchievementRepository achievementRepository;

    // Injeta o ExerciseRepository automaticamente pelo construtor
    @Autowired
    public DataInitializer(ExerciseRepository exerciseRepository, AchievementRepository achievementRepository) {
        this.exerciseRepository = exerciseRepository;
        this.achievementRepository = achievementRepository;
    }
    @Override
    public void run(String... args) throws Exception {
        // Verifica se a tabela de exercícios está vazia antes de inserir dados
        if (exerciseRepository.count() == 0) {
            log.info(">>> Populando banco de dados com exercícios de exemplo...");

            // Cria alguns objetos Exercise de exemplo
            Exercise ex1 = new Exercise(null, "Supino Reto com Barra", "Principal exercício para peitoral maior.", "Peito", "Barra e Banco");
            Exercise ex2 = new Exercise(null, "Agachamento Livre", "Exercício fundamental para membros inferiores.", "Pernas", "Barra");
            Exercise ex3 = new Exercise(null, "Levantamento Terra", "Exercício composto que trabalha costas, pernas e glúteos.", "Costas", "Barra");
            Exercise ex4 = new Exercise(null, "Corrida na Esteira", "Exercício cardiovascular.", "Cardio", "Esteira");
            Exercise ex5 = new Exercise(null, "Rosca Direta com Barra", "Exercício para bíceps.", "Bíceps", "Barra");
            // Cria uma lista com os exercícios criados
            List<Exercise> exercises = Arrays.asList(ex1, ex2, ex3, ex4, ex5);

            // Salva todos os exercícios da lista no banco de dados de uma vez
            exerciseRepository.saveAll(exercises);
            log.debug("{} exercícios salvos no banco.", exercises.size());


            log.info(">>> {} exercícios de exemplo criados.", exerciseRepository.count());

        } else {
            log.info(">>> Banco de dados de exercícios já populado. Nenhum dado novo inserido pelo Initializer.");
        }

        if (achievementRepository.count() == 0) {
            log.info(">>> Populando banco de dados com definições de conquistas...");
            Achievement ach1 = new Achievement(null, "FIRST_WORKOUT", "Iniciante", "Complete seu primeiro treino.", "/icons/first_workout.png");
            Achievement ach2 = new Achievement(null, "TEN_WORKOUTS", "Regularidade Bronze", "Complete 10 treinos.", "/icons/10_workouts.png");
            Achievement ach3 = new Achievement(null, "STREAK_7_DAYS", "Foco Semanal", "Treine por 7 dias consecutivos.", "/icons/streak_7.png");
            Achievement ach4 = new Achievement(null, "PERFECT_MONTH", "Mês Perfeito", "Complete sua meta mensal de treinos.", "/icons/perfect_month.png");

            List<Achievement> achievements = Arrays.asList(ach1, ach2, ach3, ach4);
            achievementRepository.saveAll(achievements);
            log.info(">>> {} definições de conquistas criadas.", achievementRepository.count());
        } else {
            log.info(">>> Banco de dados de conquistas já populado.");
        }
    }
}