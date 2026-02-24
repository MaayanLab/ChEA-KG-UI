'use client'
import { 
	Grid,
	Stack,
	FormControl,
	Typography,
	CircularProgress,
	Paper,
} from "@mui/material";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { router_push } from "@/utils/client_side";
import { useEffect, useRef, useState } from "react";
import { NetworkSchema } from "@/app/api/knowledge_graph/route";

const Button = dynamic(() => import('@mui/material/Button'));


const styles = {
	enabled: {
		opacity: 1,
    	borderRadius: "5px",
		width: '95%',
		"&:hover": {
			border: 1,
			borderRadius: "5px",
		},
		position: 'relative',
		color: 'black'
	},
	active: {
		opacity: 1,
		border: 1,
		width: '95%',
		borderRadius: "5px",
		boxShadow: "1",
		position: 'relative',
		color: 'black',
	}
  }

const updown_styles = {
	enabled: {
	"&:hover": {
		transform: "translateY(-3px)",
		boxShadow: "0px 2px 1px 1px rgba(0, 0, 0, 0.51)",
	},
	opacity: 1,
	boxShadow: "0px 1px 1px 1px rgba(0, 0, 0, 0.51)",
	border: "1px solid black",
	overflowWrap: "anywhere",
	borderRadius: "5px",
	
	},

	active:{
		opacity: 1,
		border: 1,
		borderColor: 'black',
		overflowWrap:'anywhere',
		borderRadius: "5px",
		"&, & *": {
			color: "black !important",
		},
		backgroundColor:'grey',
		pointerEvents: 'none',
		"&:hover": {
			border: "none",
			boxShadow: "none",
			backgroundColor: "inherit",
		},

	}
	
  }



export const AgingSelector = ({aging_gmt, group_name,  term, aging_info, elements}: 
	{aging_gmt: {[key:string]: {[key: string] : string[]}}, 
	group_name:string,
	term: string,
	aging_info: {[key:string]: {[key: string] : string}},
	elements: NetworkSchema
}) => 
		{
	const [loading, setLoading] = useState(false)
	const [clicked, setClicked] = useState(group_name)
	const router = useRouter()
	const pathname = usePathname()
	const timer = useRef(null)
	let icon_buttons = []
	const buttonStyle = styles.enabled
	const activeStyle = styles.active
	const currentTerm = group_name

	// organizing by moa and then direction for dispay
	
	useEffect(()=>{
			if (timer.current) clearTimeout(timer.current)
			setLoading(false)
		}, [elements])

	for (const term_name of ((Object.keys(aging_gmt)))) {
		let active = term_name === currentTerm ? true: false
		icon_buttons.push(
			<Link href={`/aging_atlas?q=${JSON.stringify({"min_lib":3, "group_name": term_name, "term": Object.keys(aging_gmt[term_name])[0], "zscore": 5, "search":true, "limit": 50})}`}>
			<Button key={term_name} sx={active ? activeStyle : buttonStyle} onClick={()=>{
				setLoading(true)
				setClicked(term_name) 
				timer.current = setTimeout(()=>{
					const query = {
						q: JSON.stringify({"min_lib":3, "group_name":term_name, "term": Object.keys(aging_gmt[term_name])[0], "zscore": 5, "search":true, "limit": 50})
					}
					console.log("refreshing", query)
					router_push(router, pathname, query)
				}, 12000)
				
			}}>
				{term_name}
				<CircularProgress sx={{position: "absolute", objectFit: "contain", visibility: (loading && term_name === clicked) ? 'visible' : 'hidden', pointerEvents: "none"}}/> 
			</Button>
			</Link>
		)

	}

	return (
		<>
		<Typography id="labelID" align='center'>
			<b>1. Select an aging tissue comparison</b>
		</Typography>
		<Grid container display={'grid'} gridTemplateColumns={"repeat(1, 1fr)"} spacing={2} sx={{maxHeight: 500, overflowY: 'auto'}}>
			{icon_buttons}
		</Grid>
		<Stack direction='column' spacing={3} sx={{justifyContent: 'center', alignContent:'center'}}>
			<Typography id="labelID" align='center'>
				<b>2. Select a direction of regulation</b><br></br>
			</Typography>
			<FormControl>
				<Grid container sx={{display:'grid', gridTemplateColumns:"repeat(2, 1fr)", gap:1, pointerEvents: loading ? 'none' : 'auto'}} >
					{Object.keys(aging_gmt[currentTerm]).map((direction) => (
						// {let active = term_name === currentTerm ? true: false}
						<Paper key={`${currentTerm}:${direction}`} variant='outlined' elevation={0}>
							<Link href={`/aging_atlas?q=${JSON.stringify({
											"min_lib":3, 
											"group_name": currentTerm, 
											"term": direction, 
											"zscore": (currentTerm ==='Heart' && direction  === 'up' ? 0 : 5), 
											"search":true, 
											"limit": 50, 
											...(currentTerm === 'Heart' && direction === 'up' && { add_nodes: 25 })
										})}
							`}>
							<Button sx={direction == term ? updown_styles.active : updown_styles.enabled}  
							onClick={(e)=>{
								setLoading(true)
								timer.current = setTimeout(()=>{
									const query = {
										q: JSON.stringify({
											"min_lib":3, 
											"group_name": currentTerm, 
											"term": direction, 
											"zscore": (currentTerm !='Heart' && direction  === 'up' ? 0 : 5), 
											"search":true, 
											"limit": 50, 
											...(currentTerm === 'Heart' && direction === 'up' && { add_nodes: 25 })
										})
									}
									console.log("refreshing", query)
									router_push(router, pathname, query)
								}, 12000)						
							}}>
								<div style={{ pointerEvents: "none" }}>
									<Typography sx={{fontSize:12, color:'black'}}>View {aging_gmt[currentTerm][direction].length} {direction} regulated genes</Typography>
									
									{direction == 'up'? <Typography sx={{color:'#78de93'}}><b>↑</b></Typography> : <Typography sx={{color:'#c92626ff'}}><b>↓</b></Typography>}								
								</div>
							</Button> 
							</Link>
						</Paper>
					))}
				</Grid>
			</FormControl>
		</Stack>
		</>
	)
}