export interface Exercise {
  id: number
  name: string
  sets: number
  reps: string
  weight?: number
  duration?: string
  rest: string
}

export interface WorkoutType {
  id: number
  name: string
  description: string
  category: "Força" | "Cardio" | "Funcional" | "Flexibilidade"
  difficulty: "Iniciante" | "Intermediário" | "Avançado"
  duration: string
  calories: number
  favorite: boolean
  lastPerformed: string
  exercises: Exercise[]
}

export const workoutData: WorkoutType[] = [
  {
    id: 1,
    name: "Treino de Peito e Tríceps",
    description: "Treino focado em desenvolvimento de peito e tríceps com ênfase em hipertrofia.",
    category: "Força",
    difficulty: "Intermediário",
    duration: "50 min",
    calories: 450,
    favorite: true,
    lastPerformed: "Ontem",
    exercises: [
      {
        id: 1,
        name: "Supino Reto",
        sets: 4,
        reps: "10-12",
        weight: 70,
        rest: "90s",
      },
      {
        id: 2,
        name: "Crucifixo Inclinado",
        sets: 3,
        reps: "12-15",
        weight: 16,
        rest: "60s",
      },
      {
        id: 3,
        name: "Tríceps Corda",
        sets: 4,
        reps: "12-15",
        weight: 25,
        rest: "60s",
      },
      {
        id: 4,
        name: "Supino Declinado",
        sets: 3,
        reps: "10-12",
        weight: 60,
        rest: "90s",
      },
      {
        id: 5,
        name: "Tríceps Francês",
        sets: 3,
        reps: "12",
        weight: 15,
        rest: "60s",
      },
    ],
  },
  {
    id: 2,
    name: "Treino de Pernas",
    description: "Treino completo para desenvolvimento de quadríceps, posterior e glúteos.",
    category: "Força",
    difficulty: "Avançado",
    duration: "60 min",
    calories: 520,
    favorite: true,
    lastPerformed: "3 dias atrás",
    exercises: [
      {
        id: 1,
        name: "Agachamento Livre",
        sets: 4,
        reps: "8-10",
        weight: 100,
        rest: "120s",
      },
      {
        id: 2,
        name: "Leg Press",
        sets: 4,
        reps: "10-12",
        weight: 180,
        rest: "90s",
      },
      {
        id: 3,
        name: "Cadeira Extensora",
        sets: 3,
        reps: "12-15",
        weight: 50,
        rest: "60s",
      },
      {
        id: 4,
        name: "Stiff",
        sets: 4,
        reps: "10-12",
        weight: 60,
        rest: "90s",
      },
      {
        id: 5,
        name: "Panturrilha em Pé",
        sets: 4,
        reps: "15-20",
        weight: 80,
        rest: "60s",
      },
    ],
  },
  {
    id: 3,
    name: "HIIT Cardio",
    description: "Treino intervalado de alta intensidade para queima de gordura e condicionamento.",
    category: "Cardio",
    difficulty: "Intermediário",
    duration: "30 min",
    calories: 350,
    favorite: false,
    lastPerformed: "1 semana atrás",
    exercises: [
      {
        id: 1,
        name: "Corrida Sprint",
        sets: 10,
        reps: "30s",
        duration: "30s",
        rest: "30s",
      },
      {
        id: 2,
        name: "Burpees",
        sets: 5,
        reps: "45s",
        duration: "45s",
        rest: "15s",
      },
      {
        id: 3,
        name: "Mountain Climbers",
        sets: 5,
        reps: "45s",
        duration: "45s",
        rest: "15s",
      },
      {
        id: 4,
        name: "Jumping Jacks",
        sets: 5,
        reps: "45s",
        duration: "45s",
        rest: "15s",
      },
    ],
  },
  {
    id: 4,
    name: "Treino de Costas e Bíceps",
    description: "Treino focado em desenvolvimento de costas e bíceps com ênfase em hipertrofia.",
    category: "Força",
    difficulty: "Intermediário",
    duration: "55 min",
    calories: 480,
    favorite: true,
    lastPerformed: "2 dias atrás",
    exercises: [
      {
        id: 1,
        name: "Puxada Frontal",
        sets: 4,
        reps: "10-12",
        weight: 70,
        rest: "90s",
      },
      {
        id: 2,
        name: "Remada Curvada",
        sets: 4,
        reps: "10-12",
        weight: 60,
        rest: "90s",
      },
      {
        id: 3,
        name: "Rosca Direta",
        sets: 3,
        reps: "12",
        weight: 30,
        rest: "60s",
      },
      {
        id: 4,
        name: "Pullover",
        sets: 3,
        reps: "12-15",
        weight: 25,
        rest: "60s",
      },
      {
        id: 5,
        name: "Rosca Martelo",
        sets: 3,
        reps: "12",
        weight: 14,
        rest: "60s",
      },
    ],
  },
  {
    id: 5,
    name: "Treino Funcional",
    description: "Treino funcional para melhorar força, equilíbrio e coordenação.",
    category: "Funcional",
    difficulty: "Iniciante",
    duration: "45 min",
    calories: 380,
    favorite: false,
    lastPerformed: "5 dias atrás",
    exercises: [
      {
        id: 1,
        name: "Agachamento com Salto",
        sets: 3,
        reps: "15",
        rest: "45s",
      },
      {
        id: 2,
        name: "Prancha",
        sets: 3,
        reps: "45s",
        duration: "45s",
        rest: "30s",
      },
      {
        id: 3,
        name: "Kettlebell Swing",
        sets: 3,
        reps: "15",
        weight: 16,
        rest: "45s",
      },
      {
        id: 4,
        name: "TRX Remada",
        sets: 3,
        reps: "12",
        rest: "45s",
      },
      {
        id: 5,
        name: "Escada de Agilidade",
        sets: 3,
        reps: "45s",
        duration: "45s",
        rest: "30s",
      },
    ],
  },
  {
    id: 6,
    name: "Cardio Moderado",
    description: "Treino de cardio de intensidade moderada para resistência cardiovascular.",
    category: "Cardio",
    difficulty: "Iniciante",
    duration: "40 min",
    calories: 320,
    favorite: false,
    lastPerformed: "4 dias atrás",
    exercises: [
      {
        id: 1,
        name: "Esteira",
        sets: 1,
        reps: "20 min",
        duration: "20 min",
        rest: "0s",
      },
      {
        id: 2,
        name: "Elíptico",
        sets: 1,
        reps: "15 min",
        duration: "15 min",
        rest: "0s",
      },
      {
        id: 3,
        name: "Bicicleta",
        sets: 1,
        reps: "10 min",
        duration: "10 min",
        rest: "0s",
      },
    ],
  },
]
