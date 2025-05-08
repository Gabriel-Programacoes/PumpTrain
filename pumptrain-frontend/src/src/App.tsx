import { ThemeProvider, CssBaseline } from "@mui/material"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import MyWorkouts from "./pages/MyWorkouts"
import { theme } from "./theme"

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-workouts" element={<MyWorkouts />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
