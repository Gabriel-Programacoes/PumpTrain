package com.pumptrain.pumptrain.controller;

import com.pumptrain.pumptrain.dto.UserProfileUpdateDto;
import com.pumptrain.pumptrain.dto.UserProfileDto;
import com.pumptrain.pumptrain.service.UserService;
import com.pumptrain.pumptrain.dto.UserStatsDto;
import com.pumptrain.pumptrain.dto.UserAchievementsDto;
import com.pumptrain.pumptrain.service.AchievementService;
import com.pumptrain.pumptrain.dto.FullAchievementDto;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;


@Slf4j
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final AchievementService achievementService;

    @Autowired
    public UserController(UserService userService, AchievementService achievementService) {
        this.userService = userService;
        this.achievementService = achievementService;

    }

    @GetMapping("/profile") // Mapeia GET /user/profile
    public ResponseEntity<UserProfileDto> getUserProfile(Principal principal) {
        // Validação de segurança implícita
        // Principal não será nulo se o endpoint exigir autenticação
        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa de acesso a /profile sem Principal.");
            return ResponseEntity.status(401).build();
        }
        String userEmail = principal.getName();
        log.info("Requisição recebida para buscar perfil do usuário: {}", userEmail);

        UserProfileDto profile = userService.getUserProfile(userEmail);

        return ResponseEntity.ok(profile);
    }


    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateUserProfile(Principal principal, @Valid @RequestBody UserProfileUpdateDto updateDto) {
        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa de acesso a /profile sem Principal.");
            return ResponseEntity.status(401).build();
        }
        String userEmail = principal.getName();
        log.info("Requisição recebida para atualizar perfil do usuário: {}", userEmail);
        log.debug("Dados recebidos para atualização: {}", updateDto);

        UserProfileDto updatedProfile = userService.updateUserProfile(userEmail, updateDto);
        log.info("Perfil de usuário {} atualizado com sucesso.", userEmail);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/stats") // Mapeia GET /api/user/stats
    public ResponseEntity<UserStatsDto> getUserStats(Principal principal) {
        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa de acesso a /stats sem Principal.");
            return ResponseEntity.status(401).build();
        }
        String userEmail = principal.getName();
        log.info("Requisição GET recebida para /stats do usuário: {}", userEmail);

        UserStatsDto stats = userService.getUserStats(userEmail);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/achievements") // Mapeia GET /api/user/achievements
    public ResponseEntity<UserAchievementsDto> getUserAchievements(Principal principal) {
        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa de acesso a /achievements sem Principal.");
            return ResponseEntity.status(401).build();
        }
        String userEmail = principal.getName();
        log.info("Requisição GET recebida para /achievements do usuário: {}", userEmail);

        UserAchievementsDto achievements = achievementService.getUserAchievementsSummary(userEmail);

        return ResponseEntity.ok(achievements);
    }

    @GetMapping("/achievements/all") // Mapeia GET /api/user/achievements/all
    public ResponseEntity<List<FullAchievementDto>> getAllUserAchievementsWithStatus(Principal principal) {
        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa de acesso a /achievements/all sem Principal.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userEmail = principal.getName();
        log.info("Requisição GET recebida para /achievements/all do usuário: {}", userEmail);

        List<FullAchievementDto> allAchievementsWithStatus = achievementService.getAllAchievementsWithUserStatus(userEmail);
        return ResponseEntity.ok(allAchievementsWithStatus);
    }
}