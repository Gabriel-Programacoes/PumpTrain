"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  TextField,
  Chip,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
  Fab,
} from "@mui/material"
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FitnessCenter as FitnessCenterIcon,
  Add as AddIcon,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import { type WorkoutType, workoutData } from "../data/workoutData"

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: "1px solid rgba(119, 204, 136, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  },
}))

const WorkoutImage = styled(Box)(({ theme }) => ({
  height: 140,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  position: "relative",
  marginBottom: theme.spacing(2),
  backgroundColor: "rgba(119, 204, 136, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}))

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`workout-tabpanel-${index}`}
      aria-labelledby={`workout-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `workout-tab-${index}`,
    "aria-controls": `workout-tabpanel-${index}`,
  }
}

const MyWorkouts: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [tabValue, setTabValue] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutType | null>(null)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, workout: WorkoutType) => {
    setAnchorEl(event.currentTarget)
    setSelectedWorkout(workout)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedWorkout(null)
  }

  const handleFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    setFilterAnchorEl(null)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  // Filter workouts based on search term and tab
  const filteredWorkouts = workoutData.filter((workout) => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase())

    if (tabValue === 0) return matchesSearch // All workouts
    if (tabValue === 1) return matchesSearch && workout.favorite // Favorites
    if (tabValue === 2) return matchesSearch && workout.category === "Força" // Strength
    if (tabValue === 3) return matchesSearch && workout.category === "Cardio" // Cardio

    return matchesSearch
  })

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Meus Treinos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie e acompanhe seus treinos personalizados
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar treinos..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          sx={{
            flexGrow: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "rgba(119, 204, 136, 0.05)",
              borderColor: "rgba(119, 204, 136, 0.1)",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleFilterOpen}
            sx={{
              borderColor: "rgba(119, 204, 136, 0.3)",
              color: "text.primary",
              borderRadius: 2,
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "rgba(119, 204, 136, 0.05)",
              },
            }}
          >
            Filtrar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: "primary.main",
              color: "#06070e",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            Novo Treino
          </Button>
        </Box>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 200,
            backgroundColor: theme.palette.background.paper,
            border: "1px solid rgba(119, 204, 136, 0.1)",
          },
        }}
      >
        <MenuItem onClick={handleFilterClose}>Todos os treinos</MenuItem>
        <MenuItem onClick={handleFilterClose}>Treinos favoritos</MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleFilterClose}>Treinos de força</MenuItem>
        <MenuItem onClick={handleFilterClose}>Treinos de cardio</MenuItem>
        <MenuItem onClick={handleFilterClose}>Treinos funcionais</MenuItem>
      </Menu>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
        sx={{
          mb: 2,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 500,
            minWidth: 100,
          },
          "& .Mui-selected": {
            color: "primary.main",
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "primary.main",
          },
        }}
      >
        <Tab label="Todos" {...a11yProps(0)} />
        <Tab label="Favoritos" {...a11yProps(1)} />
        <Tab label="Força" {...a11yProps(2)} />
        <Tab label="Cardio" {...a11yProps(3)} />
      </Tabs>

      {/* Workout Grid */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {filteredWorkouts.map((workout) => (
            <Grid item xs={12} sm={6} md={4} key={workout.id}>
              <WorkoutCard workout={workout} onMenuOpen={handleMenuOpen} />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {filteredWorkouts.map((workout) => (
            <Grid item xs={12} sm={6} md={4} key={workout.id}>
              <WorkoutCard workout={workout} onMenuOpen={handleMenuOpen} />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {filteredWorkouts.map((workout) => (
            <Grid item xs={12} sm={6} md={4} key={workout.id}>
              <WorkoutCard workout={workout} onMenuOpen={handleMenuOpen} />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {filteredWorkouts.map((workout) => (
            <Grid item xs={12} sm={6} md={4} key={workout.id}>
              <WorkoutCard workout={workout} onMenuOpen={handleMenuOpen} />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Mobile FAB */}
      <Box sx={{ display: { xs: "block", sm: "none" }, position: "fixed", right: 16, bottom: 16 }}>
        <Fab color="primary" aria-label="add" sx={{ color: "#06070e" }}>
          <AddIcon />
        </Fab>
      </Box>

      {/* Workout Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            backgroundColor: theme.palette.background.paper,
            border: "1px solid rgba(119, 204, 136, 0.1)",
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar treino
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir treino
        </MenuItem>
      </Menu>
    </Box>
  )
}

interface WorkoutCardProps {
  workout: WorkoutType
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, workout: WorkoutType) => void
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onMenuOpen }) => {
  return (
    <StyledCard>
      <CardContent sx={{ p: 2 }}>
        <WorkoutImage>
          <FitnessCenterIcon sx={{ fontSize: 40, color: "primary.main" }} />
        </WorkoutImage>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
            {workout.name}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => onMenuOpen(e, workout)}
            sx={{ color: "text.secondary", mt: -1, mr: -1 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Chip
            label={workout.category}
            size="small"
            sx={{
              backgroundColor: "rgba(119, 204, 136, 0.1)",
              color: "primary.main",
              fontWeight: 500,
              fontSize: "0.75rem",
            }}
          />
          <Chip
            label={`${workout.exercises.length} exercícios`}
            size="small"
            sx={{
              backgroundColor: "rgba(255, 255, 252, 0.05)",
              color: "text.secondary",
              fontWeight: 500,
              fontSize: "0.75rem",
            }}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Última vez: {workout.lastPerformed}
          </Typography>
          <Button variant="text" size="small" sx={{ color: "primary.main", fontWeight: 500, p: 0, minWidth: "auto" }}>
            Iniciar
          </Button>
        </Box>
      </CardContent>
    </StyledCard>
  )
}

export default MyWorkouts
