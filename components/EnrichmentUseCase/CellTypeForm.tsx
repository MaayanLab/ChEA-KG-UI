'use client'
import { 
	AccordionDetails, 
	AccordionSummary,
	Typography,
	List,
	ListItem,
	IconButton,
	Stack,
	Card,
	Accordion,
	CircularProgress
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { router_push } from "@/utils/client_side";
import { NetworkSchema } from "@/app/api/knowledge_graph/route";
import Link from "next/link";
export const CellTypeForm = ({cell_types, limit=10, group_name, term, elements}: {cell_types: {[key:string]: {[key: string] : string[]}}, limit?: number, term: string, group_name: string, elements: NetworkSchema}) => {
	const [loading, setLoading] = useState(false)
	const [clicked, setClicked] = useState({group: '', label: ''})
	const router = useRouter()
	const pathname = usePathname()
	const timer = useRef(null)
	useEffect(()=>{
		setClicked({group: '', label: ''})
		if (timer.current) clearTimeout(timer.current)
		setLoading(false)
	}, [elements])
	
	

	return (
		<>
		<Card sx={{height: 550, overflow: "auto", borderWidth:1, borderColor:'black', boxShadow: "none", position: "relative"}}>
		{Object.entries(cell_types).slice(0, limit).map(([group, items], i)=>(
			<Accordion elevation={0} key={group}>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls={`${group}-content`}
					id={`${group}-id`}
				>
					<Stack direction={"row"} spacing={2}>
						<div style={{ position: 'relative', width: '25px', height: '20px' }}>
						<Image src={`/organs/${group.toLowerCase()}.png`} 
							alt={group} fill
							style={{
								objectFit: 'contain',
							}}/>
						</div>
						<Typography variant="body1">{group}</Typography>
					</Stack>
				</AccordionSummary>
				<AccordionDetails >
					<List>
						{Object.keys(items).map(label=>(
							<ListItem 
								key={label}
								secondaryAction={
									// <ClientButton query={{"min_lib":3, "group_name": group, "term": label, "zscore": 5, "search":true, "limit": 50}} load={(group_name !== group) || (term !== label)}/>
									// <Link href={`/cell_atlas?q={"min_lib":3, "group_name": "${group}", "term": "${label}", "zscore": 5, "search":true, "limit": 50}`}>										
									// 	<IconButton edge="end" aria-label="enrich" > 
									// 		<ArrowForwardIcon />
									// 	</IconButton>
									// </Link>
									<Link href={`/cell_atlas?q=${JSON.stringify({"min_lib":3, "group_name": group, "term": label, "zscore": 5, "search":true, "limit": 50})}`}>
										<IconButton edge="end" sx={{position: "relative"}} aria-label="enrich" onClick={()=>{
											if ((group_name !== group) || (term !== label)) {
												setLoading(true)
												setClicked({group, label})
												timer.current = setTimeout(()=>{
													const query = {q: JSON.stringify({"min_lib":3, "group_name": group, "term": label, "zscore": 5, "search":true, "limit": 50})}
													console.log("refreshing", query)
													router_push(router, pathname, query)
												}, 50000)
												
											}
											// const query={"min_lib":3, "group_name": group, "term": label, "zscore": 5, "search":true, "limit": 50}
											// router_push(router, pathname, {q: JSON.stringify(query)})
										}}> 
												<ArrowForwardIcon /> {(loading && clicked.group === group && clicked.label === label) && <CircularProgress sx={{position: "absolute", left: 0}}/>}
											
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
		
		</Card>
		
		</>
	)
}