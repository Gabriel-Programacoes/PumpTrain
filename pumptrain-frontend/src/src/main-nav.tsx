import type React from "react"
import { Box, Button } from "@mui/material"
import { Link, useLocation } from "react-router-dom"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const location = useLocation()

  return (
    <Box sx={{ display: { xs: "none", sm: "flex" }, ml: 4 }} {...props}>
      <Button
        component={Link}
        to="/"
        sx={{
          color: location.pathname === "/" ? "primary.main" : "text.secondary",
          mx: 1,
          "&:hover": { color: "primary.main" },
        }}
      >
        PÁGINA INICIAL
      </Button>
      <Button
        component={Link}
        to="/my-workouts"
        sx={{
          color: location.pathname === "/my-workouts" ? "primary.main" : "text.secondary",
          mx: 1,
          "&:hover": { color: "primary.main" },
        }}
      >
        MEUS EXERCÍCIOS
      </Button>
      <Button
        component={Link}
        to="/exercises"
        sx={{
          color: location.pathname === "/exercises" ? "primary.main" : "text.secondary",
          mx: 1,
          "&:hover": { color: "primary.main" },
        }}
      >
        EXERCÍCIOS GERAIS
      </Button>
    </Box>
  )
}
