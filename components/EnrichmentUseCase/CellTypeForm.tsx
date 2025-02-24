import { 
	Accordion, 
	AccordionDetails, 
	AccordionSummary,
	Typography,
	List,
	ListItem,
	IconButton
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from "next/link";

export const CellTypeForm = ({cell_types, limit=10}: {cell_types: {[key:string]: {[key: string] : string[]}}, limit?: number}) => {
	return (
		<>
		{Object.entries(cell_types).slice(0, limit).map(([group, items])=>(
			<Accordion key={group} elevation={0}>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls={`${group}-content`}
					id={`${group}-id`}
				>
					<Typography variant="body1">{group}</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<List>
						{Object.keys(items).map(label=>(
							<ListItem 
								key={label}
								secondaryAction={
									<Link href={`/cell_types?q={"min_lib":3, "group_name": "${group}", "term": "${label}", "zscore": 5, "search":true, "limit": 50}`}>
										<IconButton edge="end" aria-label="enrich">
										<ArrowForwardIcon />
										</IconButton>
									</Link>
								}
							>
								<Typography variant="subtitle2">{label.replace(/-/g, ' ')}</Typography>
							</ListItem>
						))}
					</List>
				</AccordionDetails>
			</Accordion>
		))}
		</>
	)
}