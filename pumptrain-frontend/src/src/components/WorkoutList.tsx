import { Box, List, ListItem, ListItemButton, ListItemText, Typography, IconButton, Toolbar } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"

interface WorkoutItemProps {
  name: string
  reps: string
  isActive?: boolean
}

const workouts: WorkoutItemProps[] = [
  { name: "Treino de Peito", reps: "4 x 12", isActive: true },
  { name: "Treino de Costas", reps: "4 x 10" },
  { name: "Treino de Pernas", reps: "5 x 12" },
  { name: "Treino de Ombros", reps: "3 x 15" },
  { name: "Treino de Braços", reps: "4 x 12" },
  { name: "Treino HIIT", reps: "6 x 45s" },
  { name: "Treino Funcional", reps: "3 x 10" },
  { name: "Treino Abdômen", reps: "3 x 20" },
]

const WorkoutList = () => {
  return (
    <Box>
      <Toolbar
        sx={{
          borderBottom: "1px solid rgba(119, 204, 136, 0.1)",
          minHeight: "56px !important",
          px: 2,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          Meus Treinos
        </Typography>
        <IconButton
          size="small"
          sx={{
            color: "primary.main",
            border: "1px solid rgba(119, 204, 136, 0.2)",
            p: 0.5,
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Toolbar>
      <List sx={{ p: 1 }}>
        {workouts.map((workout, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              sx={{
                borderRadius: 1,
                backgroundColor: workout.isActive ? "rgba(119, 204, 136, 0.1)" : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(119, 204, 136, 0.1)",
                },
                display: "flex",
                justifyContent: "space-between",
                py: 1,
              }}
            >
              <ListItemText
                primary={workout.name}
                primaryTypographyProps={{
                  fontWeight: "medium",
                  fontSize: "0.875rem",
                }}
              />
              <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                {workout.reps}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default WorkoutList
