package com.pumptrain.pumptrain.config;

import com.pumptrain.pumptrain.entity.Achievement;
import com.pumptrain.pumptrain.entity.Exercise;
import com.pumptrain.pumptrain.entity.enums.ExerciseType;
import com.pumptrain.pumptrain.repository.AchievementRepository;
import com.pumptrain.pumptrain.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList; // Importar ArrayList
import java.util.Arrays;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class DataInitializer implements CommandLineRunner {

    private final ExerciseRepository exerciseRepository;
    private final AchievementRepository achievementRepository;

    @Autowired
    public DataInitializer(ExerciseRepository exerciseRepository, AchievementRepository achievementRepository) {
        this.exerciseRepository = exerciseRepository;
        this.achievementRepository = achievementRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Popula exercícios
        if (exerciseRepository.count() == 0) {
            log.info(">>> Populando banco de dados com exercícios de exemplo...");

            // Construtor gerado pelo Lombok @AllArgsConstructor com todos os campos:
            // id, name, description, muscleGroup, equipment, exerciseType, intensity, incline

            List<Exercise> exercises = new ArrayList<>(Arrays.asList(
                    new Exercise(null, "Supino Reto com Barra", "Principal exercício para peitoral maior.", "Peito", "Barra e Banco", ExerciseType.STRENGTH),
                    new Exercise(null, "Agachamento Livre com Barra", "Exercício fundamental para membros inferiores.", "Pernas", "Barra", ExerciseType.STRENGTH),
                    new Exercise(null, "Levantamento Terra", "Exercício composto que trabalha costas, pernas e glúteos.", "Costas", "Barra", ExerciseType.STRENGTH),
                    new Exercise(null, "Corrida na Esteira", "Exercício cardiovascular.", "Cardio", "Esteira", ExerciseType.CARDIO),
                    new Exercise(null, "Rosca Direta com Barra", "Exercício para bíceps.", "Bíceps", "Barra", ExerciseType.STRENGTH),
                    new Exercise(null, "Desenvolvimento Militar com Barra", "Exercício para desenvolvimento dos ombros.", "Ombros", "Barra", ExerciseType.STRENGTH),
                    new Exercise(null, "Barra Fixa", "Exercício de peso corporal para costas e bíceps.", "Costas", "Barra de Pull-up", ExerciseType.STRENGTH),
                    new Exercise(null, "Afundo (Lunge)", "Exercício unilateral para pernas e glúteos.", "Pernas", "Peso Corporal/Halteres", ExerciseType.STRENGTH),
                    new Exercise(null, "Prancha Abdominal (Plank)", "Exercício isométrico para o core.", "Abdômen", "Peso Corporal", ExerciseType.STRENGTH),
                    new Exercise(null, "Bicicleta Ergométrica", "Exercício cardiovascular de baixo impacto.", "Cardio", "Bicicleta Ergométrica", ExerciseType.CARDIO),
                    new Exercise(null, "Remada Curvada com Barra", "Exercício para dorsais e músculos superiores das costas.", "Costas", "Barra", ExerciseType.STRENGTH),
                    new Exercise(null, "Tríceps Testa com Barra", "Exercício para tríceps.", "Tríceps", "Barra EZ/Halteres", ExerciseType.STRENGTH),
                    new Exercise(null, "Pular Corda", "Exercício cardiovascular e de coordenação.", "Cardio", "Corda", ExerciseType.CARDIO),
                    new Exercise(null, "Flexão de Braço (Push-up)", "Exercício de peso corporal para peito, ombros e tríceps.", "Peito", "Peso Corporal", ExerciseType.STRENGTH),
                    new Exercise(null, "Elíptico (Transport)", "Exercício cardiovascular que simula corrida, caminhada e subida de escadas.", "Cardio", "Aparelho Elíptico", ExerciseType.CARDIO)
            ));

            exerciseRepository.saveAll(exercises);
            log.debug("{} exercícios salvos no banco.", exercises.size());
            log.info(">>> {} exercícios de exemplo criados.", exerciseRepository.count());
        } else {
            log.info(">>> Banco de dados de exercícios já populado. Nenhum dado novo inserido pelo Initializer.");
        }

        // Popula definições de Conquistas com os novos campos
        if (achievementRepository.count() == 0) {
            log.info(">>> Populando banco de dados com definições de conquistas...");

            // Construtor de Achievement: id, achievementKey, name, description, iconUrl, category, rarity, targetValue
            Achievement ach1 = new Achievement(null, "FIRST_WORKOUT", "Iniciante de Ferro", "Complete seu primeiro treino concluído.", "/icons/first_workout.png", "Início", "Bronze", 1);
            Achievement ach2 = new Achievement(null, "TEN_WORKOUTS", "Regularidade Prata", "Complete 10 treinos concluídos.", "/icons/10_workouts.png", "Consistência", "Prata", 10);
            Achievement ach3 = new Achievement(null, "STREAK_7_DAYS", "Foco Semanal Ouro", "Conclua treinos por 7 dias consecutivos.", "/icons/streak_7.png", "Consistência", "Ouro", 7);
            Achievement ach4 = new Achievement(null, "PERFECT_MONTH", "Mês de Diamante", "Complete 20 treinos concluídos em um único mês.", "/icons/calendar.png", "Dedicação", "Diamante", 20);

            List<Achievement> achievements = Arrays.asList(ach1, ach2, ach3, ach4);
            achievementRepository.saveAll(achievements);
            log.info(">>> {} definições de conquistas criadas.", achievementRepository.count());
        } else {
            log.info(">>> Banco de dados de conquistas já populado.");
        }
    }
}