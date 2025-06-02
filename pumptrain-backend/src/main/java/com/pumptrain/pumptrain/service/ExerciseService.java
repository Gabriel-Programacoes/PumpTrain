package com.pumptrain.pumptrain.service;

import com.pumptrain.pumptrain.dto.ExerciseDto;
import com.pumptrain.pumptrain.dto.ExerciseCreateDto;
import com.pumptrain.pumptrain.entity.Exercise;
import com.pumptrain.pumptrain.mapper.ExerciseMapper;
import com.pumptrain.pumptrain.repository.ExerciseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final ExerciseMapper exerciseMapper;

    @Autowired
    public ExerciseService(ExerciseRepository exerciseRepository, ExerciseMapper exerciseMapper) {
        this.exerciseRepository = exerciseRepository;
        this.exerciseMapper = exerciseMapper;
    }

    /**
     * Busca todos os exercícios cadastrados.
     * @return Uma lista de ExerciseDto.
     */

    // --- MÉTODO PARA CRIAR EXERCÍCIO ---
    @Transactional // Garante que a operação seja atômica
    public ExerciseDto createExercise(ExerciseCreateDto createDto) {
        log.info("Tentando criar novo exercício com nome: {}", createDto.getName());

        // 1. Verifica se já existe um exercício com o mesmo nome (ignorando case)
        exerciseRepository.findByNameIgnoreCase(createDto.getName()).ifPresent(existing -> {
            log.warn("Tentativa de criar exercício com nome duplicado: {}", createDto.getName());
            throw new DataIntegrityViolationException("Já existe um exercício com o nome '" + createDto.getName() + "'.");
        });

        // 2. Mapeia o DTO de criação para a Entidade
        Exercise exerciseToSave = exerciseMapper.toEntity(createDto);
        log.debug("Entidade Exercise mapeada a partir do DTO: {}", exerciseToSave);

        // 3. Salva a nova entidade no banco de dados
        Exercise savedExercise = exerciseRepository.save(exerciseToSave);
        log.info("Exercício salvo com ID: {}", savedExercise.getId());

        // 4. Mapeia a entidade salva para o DTO de resposta e retorna
        return exerciseMapper.toDto(savedExercise);
    }

    // --- MÉTODO PARA LISTAR EXERCÍCIOS (Para GET /api/exercises) ---
    @Transactional(readOnly = true)
    public List<ExerciseDto> getAllExercises() {
        log.info("Buscando todos os exercícios.");
        List<Exercise> exercises = exerciseRepository.findAll();
        log.debug("Encontrados {} exercícios.", exercises.size());

        // --- INÍCIO DO LOG DE DEPURAÇÃO ---
        log.info("Verificando valores da entidade Exercise ANTES do mapeamento para ExerciseDto:");
        for (Exercise exerciseEntity : exercises) {
            if ("Corrida na Esteira".equals(exerciseEntity.getName())) { // Ou o nome do exercício que você está testando
                log.info("ENTIDADE 'Corrida na Esteira': ID={}, Nome={}, Tipo={}",
                        exerciseEntity.getId(),
                        exerciseEntity.getName(),
                        exerciseEntity.getExerciseType()
                );
            }
        }
        // --- FIM DO LOG DE DEPURAÇÃO ---

        List<ExerciseDto> exerciseDtos = exerciseMapper.toDto(exercises); // Mapeamento ocorre aqui

        // --- INÍCIO DO LOG DE DEPURAÇÃO ---
        log.info("Verificando valores do ExerciseDto APÓS o mapeamento:");
        for (ExerciseDto exerciseDto : exerciseDtos) {
            if ("Corrida na Esteira".equals(exerciseDto.getName())) { // Ou o nome do exercício que você está testando
                log.info("DTO 'Corrida na Esteira': ID={}, Nome={}, Tipo={}",
                        exerciseDto.getId(),
                        exerciseDto.getName(),
                        exerciseDto.getExerciseType()
                );
            }
        }
        // --- FIM DO LOG DE DEPURAÇÃO ---

        return exerciseDtos;
    }

    // --- MÉTODO PARA DELETAR EXERCÍCIO (Para DELETE /api/exercises/{id}) ---
    @Transactional
    public void deleteExercise(Long exerciseId) {
        log.info("Tentando excluir exercício ID: {}", exerciseId);
        if (!exerciseRepository.existsById(exerciseId)) {
            log.warn("Falha ao excluir: Exercício ID {} não encontrado.", exerciseId);
            throw new EntityNotFoundException("Exercício não encontrado com ID: " + exerciseId);
        }
        exerciseRepository.deleteById(exerciseId);
        log.info("Exercício ID: {} excluído com sucesso.", exerciseId);
    }
}