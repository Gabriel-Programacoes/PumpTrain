import { Box, Button } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

const MainNavigation = () => {
    const location = useLocation();

    const myWorkoutsPath = "/workouts";
    const exercisesPath = "/exercises";

    return (
        <Box sx={{ display: { xs: "none", sm: "flex" }, justifyContent: "center", mx: "auto" }}>
            <Button
                component={RouterLink}
                to={myWorkoutsPath}
                sx={{
                    color: location.pathname.startsWith(myWorkoutsPath) || location.pathname.startsWith('/workouts') ? "primary.main" : "text.secondary",
                    fontWeight: location.pathname.startsWith(myWorkoutsPath) || location.pathname.startsWith('/workouts') ? 'bold' : 'normal',
                    mx: 1,
                    "&:hover": { color: "primary.main" },
                }}
            >
                MEUS TREINOS
            </Button>
            <Button
                component={RouterLink}
                to={exercisesPath}
                sx={{
                    color: location.pathname === exercisesPath ? "primary.main" : "text.secondary",
                    fontWeight: location.pathname === exercisesPath ? 'bold' : 'normal',
                    mx: 1,
                    "&:hover": { color: "primary.main" },
                }}
            >
                EXERCÍCIOS
            </Button>
        </Box>
    )
}

export default MainNavigation;