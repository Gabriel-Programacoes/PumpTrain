"use client"

import { useState } from "react"
import { styled } from "@mui/material/styles"
import { Box, AppBar, Toolbar, Typography, Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter"
import MainNavigation from "../components/MainNavigation"
import UserMenu from "../components/UserMenu"
import WorkoutList from "../components/WorkoutList"
import Dashboard from "../components/Dashboard"

const drawerWidth = 240

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}))

const Home = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FitnessCenterIcon sx={{ color: "primary.main" }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase", color: "primary.main" }}
            >
              PumpTrain
            </Typography>
          </Box>
          <MainNavigation />
          <Box sx={{ flexGrow: 1 }} />
          <UserMenu />
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <WorkoutList />
        </Box>
      </Drawer>

      <Main open={!isMobile}>
        <Toolbar />
        <Dashboard />
      </Main>
    </Box>
  )
}

export default Home
