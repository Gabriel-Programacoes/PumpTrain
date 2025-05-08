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
import java.time.LocalDateTime; // Necessário para completedAt
import java.time.YearMonth;
import java.util.Comparator; // Necessário para ordenar datas
import java.util.List;
import java.util.stream.Collectors; // Necessário para stream

@Slf4j
@Service
@RequiredArgsConstructor // <<< Lombok para injeção de dependência via construtor
public class UserService {

    // Campos agora são 'final' para injeção via @RequiredArgsConstructor
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final WorkoutSessionRepository workoutSessionRepository;

    // Construtor explícito removido, Lombok cuida da injeção

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
        // newUser.setCreatedAt() é chamado via @PrePersist na entidade

        User savedUser = userRepository.save(newUser);
        log.info("Novo usuário salvo com sucesso. ID: {}, Email: {}", savedUser.getId(), savedUser.getEmail());
        return savedUser; // Retornar o usuário salvo
    }

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(String userEmail) {
        log.debug("Buscando perfil para usuário: {}", userEmail);
        User user = findUserByEmailOrThrow(userEmail); // <<< Usa método auxiliar
        // Assume que UserMapper mapeia todos os campos necessários (incluindo age, height, weight se adicionados)
        UserProfileDto userProfileDto = userMapper.toUserProfileDto(user);
        log.debug("Perfil DTO criado para usuário: {}", userEmail);
        return userProfileDto;
    }

    @Transactional
    public UserProfileDto updateUserProfile(String userEmail, UserProfileUpdateDto updateDto) {
        log.info("Tentando atualizar perfil para usuário: {}", userEmail);
        User user = findUserByEmailOrThrow(userEmail); // <<< Usa método auxiliar

        // Atualiza os campos permitidos
        user.setName(updateDto.getName());
        log.debug("Campo 'name' atualizado para o usuário {}", userEmail);

        // Atualiza outros campos se existirem no DTO e na Entidade
        if (updateDto.getAge() != null) { // Assume que getAge() existe no DTO
            user.setAge(updateDto.getAge()); // Assume que setAge() existe na Entidade
            log.debug("Campo 'age' atualizado para o usuário {}", userEmail);
        }
        if (updateDto.getHeight() != null) { // Assume que getHeight() existe no DTO
            user.setHeight(updateDto.getHeight()); // Assume que setHeight() existe na Entidade
            log.debug("Campo 'height' atualizado para o usuário {}", userEmail);
        }
        if (updateDto.getWeight() != null) { // Assume que getWeight() existe no DTO
            user.setWeight(updateDto.getWeight()); // Assume que setWeight() existe na Entidade
            log.debug("Campo 'weight' atualizado para o usuário {}", userEmail);
        }

        User savedUser = userRepository.save(user);
        log.info("Perfil atualizado e salvo para usuário: {}", userEmail);
        // Assume que UserMapper mapeia todos os campos necessários (incluindo age, height, weight se adicionados)
        return userMapper.toUserProfileDto(savedUser);
    }

    @Transactional(readOnly = true)
    public UserStatsDto getUserStats(String userEmail) {
        log.info("Calculando estatísticas para usuário: {}", userEmail);
        User user = findUserByEmailOrThrow(userEmail); // <<< Usa método auxiliar

        // Calcula Total de Treinos (independente de concluído ou não)
        long totalWorkoutsRegistered = workoutSessionRepository.countByUser(user);
        log.debug("Total de treinos registrados para {}: {}", userEmail, totalWorkoutsRegistered);

        // Calcula Treinos Concluídos no Mês Atual
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();
        // PRECISA de um método que conte por data de CONCLUSÃO e não SESSION_DATE
        // Vamos assumir que ele existe ou precisaria ser adicionado ao repositório:
        // int workoutsCompletedThisMonth = workoutSessionRepository.countByUserAndCompletedAtBetween(user, startOfMonth.atStartOfDay(), endOfMonth.atTime(LocalTime.MAX));
        // *** SOLUÇÃO TEMPORÁRIA: Contando pela sessionDate ainda ***
        // TODO: Ajustar query no repositório para contar por completedAt se necessário para esta métrica
        int workoutsThisMonthBasedOnSessionDate = workoutSessionRepository.countByUserAndSessionDateBetween(user, startOfMonth, endOfMonth);
        log.warn("Calculando 'workoutsThisMonth' baseado em sessionDate. Ajustar para completedAt se necessário.");
        log.debug("Treinos (base sessionDate) no mês {} para {}: {}", currentMonth, userEmail, workoutsThisMonthBasedOnSessionDate);

        // Calcula Streaks (usando método auxiliar e completedAt)
        StreakInfo streakInfo = calculateStreaksBasedOnCompletion(user);
        log.debug("Streaks (baseado em conclusão) para {}: Atual={}, Recorde={}", userEmail, streakInfo.currentStreak(), streakInfo.recordStreak());

        // Constrói o DTO
        UserStatsDto statsDto = UserStatsDto.builder()
                .workoutsTotal(totalWorkoutsRegistered) // Renomeado para clareza
                .workoutsThisMonth(workoutsThisMonthBasedOnSessionDate) // Usando contagem por sessionDate por enquanto
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

    private StreakInfo calculateStreaksBasedOnCompletion(User user) {
        List<LocalDateTime> completedTimestamps = workoutSessionRepository.findCompletedAtTimestampsByUserOrderByCompletedAtDesc(user);

        // Converte para DATAS distintas e ordena DESC
        List<LocalDate> distinctDates = completedTimestamps.stream()
                .map(LocalDateTime::toLocalDate)
                .distinct()
                .sorted(Comparator.reverseOrder()) // Garante ordem DESC
                .collect(Collectors.toList());

        log.debug("[calculateStreaks] Datas de CONCLUSÃO distintas (DESC): {}", distinctDates);

        if (distinctDates.isEmpty()) {
            log.debug("[calculateStreaks] Lista de datas de conclusão vazia, retornando 0,0.");
            return new StreakInfo(0, 0);
        }

        // Lógica de cálculo de current e record streak
        int calculatedCurrentStreak = 0;
        int calculatedRecordStreak = 0;
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate mostRecentCompletionDate = distinctDates.get(0);

        log.debug("[calculateStreaks] Hoje={}, Ontem={}, MaisRecenteConclusão={}", today, yesterday, mostRecentCompletionDate);

        // Cálculo da Current Streak
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
            calculatedCurrentStreak = 0;
            log.debug("[calculateStreaks] Conclusão mais recente não foi hoje nem ontem. currentStreak = 0");
        }

        // Cálculo da Record Streak
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
                    currentLoopStreak = 1; // Reseta para o dia atual isolado
                }
                maxStreakFound = Math.max(maxStreakFound, currentLoopStreak);
            }
        }
        calculatedRecordStreak = maxStreakFound;

        log.debug("[calculateStreaks] Final (baseado em conclusão): current={}, record={}", calculatedCurrentStreak, calculatedRecordStreak);
        return new StreakInfo(calculatedCurrentStreak, calculatedRecordStreak);
    }

    // Inner record auxiliar para streaks
    private record StreakInfo(int currentStreak, int recordStreak) {}

}