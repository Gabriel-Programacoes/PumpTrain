package com.pumptrain.pumptrain.service;

import com.pumptrain.pumptrain.dto.UserProfileDto;
import com.pumptrain.pumptrain.dto.UserProfileUpdateDto;
import com.pumptrain.pumptrain.dto.UserRegistrationDto;
import com.pumptrain.pumptrain.dto.UserStatsDto;
import com.pumptrain.pumptrain.entity.User;
import com.pumptrain.pumptrain.exception.DuplicateEmailException;
import com.pumptrain.pumptrain.mapper.UserMapper;
import com.pumptrain.pumptrain.repository.UserRepository;
import com.pumptrain.pumptrain.repository.WorkoutSessionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime; // <<< Adicionar para .atTime(LocalTime.MAX)
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final WorkoutSessionRepository workoutSessionRepository;

    @Transactional
    public User registerUser(UserRegistrationDto registrationDto) {
        String email = registrationDto.getEmail();
        log.info("Tentando registrar novo usuário com email: {}", email);
        log.debug("Verificando se o email {} já existe...", email);

        userRepository.findByEmail(email).ifPresent(existingUser -> {
            log.warn("Falha no registro: Email {} já cadastrado.", email);
            throw new DuplicateEmailException("Email já cadastrado: " + email);
        });

        log.debug("Email {} disponível. Criando novo usuário...", email);
        User newUser = new User();
        newUser.setName(registrationDto.getName());
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        // createdAt é gerenciado por @PrePersist na entidade User

        User savedUser = userRepository.save(newUser);
        log.info("Novo usuário salvo com sucesso. ID: {}, Email: {}", savedUser.getId(), savedUser.getEmail());
        return savedUser;
    }

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(String userEmail) {
        log.debug("Buscando perfil para usuário: {}", userEmail);
        User user = findUserByEmailOrThrow(userEmail);
        // Assume que UserMapper foi atualizado ou mapeia age, height, weight automaticamente se existirem
        UserProfileDto userProfileDto = userMapper.toUserProfileDto(user);
        log.debug("Perfil DTO criado para usuário: {}", userEmail);
        return userProfileDto;
    }

    @Transactional
    public UserProfileDto updateUserProfile(String userEmail, UserProfileUpdateDto updateDto) {
        log.info("Tentando atualizar perfil para usuário: {}", userEmail);
        User user = findUserByEmailOrThrow(userEmail);

        user.setName(updateDto.getName());
        log.debug("Campo 'name' atualizado para o usuário {}", userEmail);

        if (updateDto.getAge() != null) { // Assume que DTO tem getAge()
            user.setAge(updateDto.getAge());   // Assume que Entidade tem setAge()
            log.debug("Campo 'age' atualizado para o usuário {}", userEmail);
        }
        if (updateDto.getHeight() != null) { // Assume que DTO tem getHeight()
            user.setHeight(updateDto.getHeight()); // Assume que Entidade tem setHeight()
            log.debug("Campo 'height' atualizado para o usuário {}", userEmail);
        }
        if (updateDto.getWeight() != null) { // Assume que DTO tem getWeight()
            user.setWeight(updateDto.getWeight()); // Assume que Entidade tem setWeight()
            log.debug("Campo 'weight' atualizado para o usuário {}", userEmail);
        }

        User savedUser = userRepository.save(user);
        log.info("Perfil atualizado e salvo para usuário: {}", userEmail);
        return userMapper.toUserProfileDto(savedUser);
    }

    @Transactional(readOnly = true)
    public UserStatsDto getUserStats(String userEmail) {
        log.info("Calculando estatísticas para usuário: {}", userEmail);
        User user = findUserByEmailOrThrow(userEmail);

        // Calcula Total de Treinos REGISTRADOS (não necessariamente concluídos)
        long totalWorkoutsRegistered = workoutSessionRepository.countByUser(user);
        log.debug("Total de treinos registrados para {}: {}", userEmail, totalWorkoutsRegistered);

        // Calcula Treinos CONCLUÍDOS no Mês Atual
        YearMonth currentYMonth = YearMonth.now();
        LocalDateTime startOfMonthDateTime = currentYMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonthDateTime = currentYMonth.atEndOfMonth().atTime(LocalTime.MAX); // Usa LocalTime.MAX para o fim do dia

        // VVVVV CORREÇÃO DA CHAMADA E NOME DA VARIÁVEL VVVVV
        int workoutsCompletedThisMonth = workoutSessionRepository.countByUserAndCompletedAtBetween(user, startOfMonthDateTime, endOfMonthDateTime);
        log.debug("Treinos CONCLUÍDOS no mês {} para {}: {}", currentYMonth, userEmail, workoutsCompletedThisMonth);
        // ^^^^^ CORREÇÃO DA CHAMADA E NOME DA VARIÁVEL ^^^^^

        // Calcula Streaks baseado em treinos CONCLUÍDOS
        StreakInfo streakInfo = calculateStreaksBasedOnCompletion(user);
        log.debug("Streaks (baseado em conclusão) para {}: Atual={}, Recorde={}", userEmail, streakInfo.currentStreak(), streakInfo.recordStreak());

        // Constrói o DTO
        UserStatsDto statsDto = UserStatsDto.builder()
                .workoutsTotal(totalWorkoutsRegistered) // Mantém o total de treinos registrados
                .workoutsThisMonth(workoutsCompletedThisMonth) // Agora reflete os treinos CONCLUÍDOS no mês
                .currentStreak(streakInfo.currentStreak())
                .recordStreak(streakInfo.recordStreak())
                .build();

        log.info("Estatísticas calculadas para {}", userEmail);
        return statsDto;
    }

    private User findUserByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Usuário não encontrado com email: {}", email);
                    return new EntityNotFoundException("Usuário não encontrado com email: " + email);
                });
    }

    public record StreakInfo(int currentStreak, int recordStreak) {}

    StreakInfo calculateStreaksBasedOnCompletion(User user) {
        List<LocalDateTime> completedTimestamps = workoutSessionRepository.findCompletedAtTimestampsByUserOrderByCompletedAtDesc(user);

        List<LocalDate> distinctDates = completedTimestamps.stream()
                .map(LocalDateTime::toLocalDate)
                .distinct()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());

        log.debug("[calculateStreaks] Datas de CONCLUSÃO distintas (DESC): {}", distinctDates);

        if (distinctDates.isEmpty()) {
            log.debug("[calculateStreaks] Lista de datas de conclusão vazia, retornando 0,0.");
            return new StreakInfo(0, 0);
        }

        int calculatedCurrentStreak = 0;
        int calculatedRecordStreak = 0;
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate mostRecentCompletionDate = distinctDates.getFirst();

        log.debug("[calculateStreaks] Hoje={}, Ontem={}, MaisRecenteConclusão={}", today, yesterday, mostRecentCompletionDate);

        if (mostRecentCompletionDate.equals(today) || mostRecentCompletionDate.equals(yesterday)) {
            calculatedCurrentStreak = 1;
            log.debug("[calculateStreaks] Iniciando currentStreak = 1 (baseado em conclusão hoje/ontem)");
            for (int i = 1; i < distinctDates.size(); i++) {
                LocalDate currentDate = distinctDates.get(i);
                LocalDate previousDate = distinctDates.get(i - 1);
                if (currentDate.plusDays(1).equals(previousDate)) {
                    calculatedCurrentStreak++;
                } else {
                    break;
                }
            }
        } else {
            log.debug("[calculateStreaks] Conclusão mais recente não foi hoje nem ontem. currentStreak = 0");
        }

        int maxStreakFound = 0;
        if (!distinctDates.isEmpty()) {
            int currentLoopStreak = 1;
            maxStreakFound = 1;
            for (int i = 1; i < distinctDates.size(); i++) {
                LocalDate currentDate = distinctDates.get(i);
                LocalDate previousDate = distinctDates.get(i - 1);
                if (currentDate.plusDays(1).equals(previousDate)) {
                    currentLoopStreak++;
                } else {
                    currentLoopStreak = 1;
                }
                maxStreakFound = Math.max(maxStreakFound, currentLoopStreak);
            }
        }
        calculatedRecordStreak = maxStreakFound;

        log.debug("[calculateStreaks] Final (baseado em conclusão): current={}, record={}", calculatedCurrentStreak, calculatedRecordStreak);
        return new StreakInfo(calculatedCurrentStreak, calculatedRecordStreak);
    }
}