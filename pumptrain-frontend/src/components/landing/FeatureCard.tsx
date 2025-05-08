import type { ReactNode } from "react"
import { Card, CardContent, Typography, Avatar } from "@mui/material"

interface FeatureCardProps {
    icon: ReactNode
    title: string
    description: string
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
    return (
        <Card
            variant="outlined"
            sx={{
                height: "100%",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                },
            }}
        >
            <CardContent sx={{ p: 4 }}>
                <Avatar
                    sx={{
                        bgcolor: "rgba(119, 204, 136, 0.1)",
                        color: "primary.main",
                        width: 56,
                        height: 56,
                        mb: 2,
                    }}
                >
                    {icon}
                </Avatar>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </CardContent>
        </Card>
    )
}

export default FeatureCard
