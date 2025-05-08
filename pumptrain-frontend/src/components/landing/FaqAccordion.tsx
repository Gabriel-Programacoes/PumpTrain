import type React from "react"
import { useState } from "react"
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

interface FaqItem {
    question: string
    answer: string
}

interface FaqAccordionProps {
    faqs: FaqItem[]
}

const FaqAccordion = ({ faqs }: FaqAccordionProps) => {
    const [expanded, setExpanded] = useState<string | false>(false)

    const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false)
    }

    return (
        <Box>
            {faqs.map((faq, index) => (
                <Accordion
                    key={index}
                    expanded={expanded === `panel${index}`}
                    onChange={handleChange(`panel${index}`)}
                    sx={{
                        mb: 1,
                        border: "1px solid rgba(119, 204, 136, 0.1)",
                        "&:before": {
                            display: "none",
                        },
                        borderRadius: "4px !important",
                        overflow: "hidden",
                        boxShadow: "none",
                        "&.Mui-expanded": {
                            margin: "0 0 8px 0",
                        },
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel${index}bh-content`}
                        id={`panel${index}bh-header`}
                        sx={{
                            "&.Mui-expanded": {
                                minHeight: 48,
                            },
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {faq.question}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                            {faq.answer}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    )
}

export default FaqAccordion
