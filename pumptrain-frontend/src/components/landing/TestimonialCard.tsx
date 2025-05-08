import { Card, CardContent, Typography, Avatar, Box, Rating } from "@mui/material"
import FormatQuoteIcon from "@mui/icons-material/FormatQuote"

interface TestimonialCardProps {
    name: string
    role: string
    image: string
    quote: string
}

const TestimonialCard = ({ name, role, image, quote }: TestimonialCardProps) => {
    return (
        <Card
            variant="outlined"
            sx={{
                height: "100%",
                position: "relative",
                pt: 2,
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: 16,
                    left: 24,
                    color: "rgba(119, 204, 136, 0.2)",
                    fontSize: 40,
                }}
            >
                <FormatQuoteIcon fontSize="inherit" />
            </Box>
            <CardContent sx={{ p: 4 }}>
                <Typography
                    variant="body1"
                    sx={{
                        mb: 3,
                        pt: 3,
                        fontStyle: "italic",
                        color: "text.secondary",
                        minHeight: 80,
                    }}
                >
                    "{quote}"
                </Typography>
                <Rating value={5} readOnly size="small" sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar src={image} alt={name} sx={{ width: 48, height: 48, mr: 2 }} />
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {role}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}

export default TestimonialCard
