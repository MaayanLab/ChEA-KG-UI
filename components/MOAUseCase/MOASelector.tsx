'use client'
import { 
	Grid,
	MenuItem,
	Stack,
	Select,
	InputLabel,
	FormControl,
	Typography,
	CircularProgress,
	Box,
	Paper,
	styled
} from "@mui/material";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "next-usequerystate";
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
		color: 'black'
	}
  }

const updown_styles = {
	enabled: {
	"&:hover": {
		transform: "translateY(-2px)",
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
		backgroundColor:'primary.main',

	}
	
  }



export const MOASelector = ({moa_gmt, group_name,  term, moa_info, elements}: 
	{moa_gmt: {[key:string]: {[key: string] : string[]}}, 
	group_name:string,
	term: string,
	moa_info: {[key:string]: {[key: string] : string}},
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
	const currentMOA = group_name

	// organizing by moa and then direction for dispay
	
	useEffect(()=>{
			if (timer.current) clearTimeout(timer.current)
			setLoading(false)
		}, [elements])

	for (const moa_name of ((Object.keys(moa_gmt)))) {
		let active = moa_name === currentMOA ? true: false
		icon_buttons.push(
			<Link href={`/moa_atlas?q=${JSON.stringify({"min_lib":3, "group_name": moa_name, "term": Object.keys(moa_gmt[moa_name])[0], "zscore": 5, "search":true, "limit": 50})}`}>
			<Button key={moa_name} sx={active ? activeStyle : buttonStyle} onClick={()=>{
				setLoading(true)
				setClicked(moa_name) 
				timer.current = setTimeout(()=>{
					const query = {
						q: JSON.stringify({"min_lib":3, "group_name":moa_name, "term": Object.keys(moa_gmt[moa_name])[0], "zscore": 5, "search":true, "limit": 50})
					}
					console.log("refreshing", query)
					router_push(router, pathname, query)
				}, 12000)
				
			}}>
				{moa_name}
				{(loading && moa_name === clicked) && <CircularProgress sx={{position: "absolute", objectFit: "contain"}}/> }
			</Button>
			</Link>
		)

	}

	return (
		<>
		<Typography id="labelID" align='center'>
			<b>1. Select a mechanism of action</b>
		</Typography>
		<Grid container display={'grid'} gridTemplateColumns={"repeat(1, 1fr)"} spacing={2} sx={{maxHeight: 500, overflowY: 'auto'}}>
			{icon_buttons}
		</Grid>
		<Stack direction='column' spacing={3} sx={{justifyContent: 'center', alignContent:'center'}}>
			<Typography id="labelID" align='center'>
				<b>2. Select a direction of regulation</b><br></br>
				<p style={{fontSize: '12px', textAlign:'left'}}> For <b>{currentMOA}</b>, <u>{moa_info[`${currentMOA}:up`].num_sigs}</u> signatures, representing <u>{moa_info[`${currentMOA}:up`].drug_list.length}</u> unique drugs, were used to construct consensus gene sets: </p>
			</Typography>
			<FormControl>
				<Grid container sx={{display:'grid', gridTemplateColumns:"repeat(2, 1fr)", gap:1}} >
					{Object.keys(moa_gmt[currentMOA]).map((direction) => (
						// {let active = moa_name === currentMOA ? true: false}
						<Paper variant='outlined' elevation={0}>
							<Link href={`/moa_atlas?q=${JSON.stringify({"min_lib":3, "group_name": currentMOA, "term": direction, "zscore": 5, "search":true, "limit": 50})}`}>
							<Button sx={direction == term ? updown_styles.active : updown_styles.enabled}  
							onClick={(e)=>{
								setLoading(true)
								timer.current = setTimeout(()=>{
									const query = {
										q: JSON.stringify({"min_lib":3, "group_name": currentMOA, "term": direction, "zscore": 5, "search":true, "limit": 50})
									}
									console.log("refreshing", query)
									router_push(router, pathname, query)
								}, 12000)						
							}}>
								<div>
									<Typography sx={{fontSize:12, color:'black'}}>View {moa_gmt[currentMOA][direction].length} {direction} regulated genes</Typography>
									
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