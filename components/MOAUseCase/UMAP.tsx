'use client'
import { 
	Grid,
	MenuItem,
	Stack,
	Select,
	InputLabel,
	FormControl,
	Typography,
	CircularProgress
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
		"&:hover": {
			border: 1,
			borderRadius: "5px",
		},
		position: 'relative'
	},
	active: {
		opacity: 1,
		border: 1,
		borderRadius: "5px",
		boxShadow: "1",
		position: 'relative'
	}
  }



export const MOASelector = ({moas, group_name,  info, term, elements}: 
	{moas: {[key:string]: {[key: string] : string[]}}, 
	group_name:string,
	info: {[key:string]: {[key: string] : string}},
	term: string,
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
	const currentDirection = group_name
	const currentTerm = term
	
	// organizing by moa and then direction for dispay
	const moas_reorganized = Object.entries(moas).reduce(
		(new_dict, [direction, terms]) => {
			Object.entries(terms).forEach(([term, list]) => {
			new_dict[term] ??= {}
			new_dict[term][direction] = list
			})
			return new_dict
		},
		{} as Record<string, Record<string, any[]>>
		)
	useEffect(()=>{
			if (timer.current) clearTimeout(timer.current)
			setLoading(false)
		}, [elements])
	for (const moa_name of ((Object.keys(moas_reorganized)))) {
		let active = moa_name === currentTerm ? true : false
		icon_buttons.push(
			<Link href={`/moa_atlas?q=${JSON.stringify({"min_lib":3, "direction": Object.keys(moas_reorganized[moa_name])[0], "term": moa_name, "zscore": 5, "search":true, "limit": 50})}`}>
			<Button key={moa_name} sx={active ? activeStyle : buttonStyle} onClick={()=>{
				setLoading(true)
				setClicked(moa_name)
				timer.current = setTimeout(()=>{
					const query = {
						q: JSON.stringify({"min_lib":3, "direction": Object.keys(moas_reorganized[moa_name])[0], "term": moa_name, "zscore": 5, "search":true, "limit": 50})
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
		<Grid container display={'grid'} gridTemplateColumns={"repeat(1, 1fr)"} spacing={2} sx={{maxHeight: 500, overflowY: 'auto'}}>
				{icon_buttons}
			</Grid>
			<Grid>
			<Stack direction='column' spacing={3} sx={{justifyContent: 'center', alignContent:'center'}}>
			<FormControl fullWidth>

				<InputLabel id="labelID">Direction of regulation, <b>{currentTerm}</b></InputLabel>
				<Select fullWidth value={currentDirection} labelId="labelID" id="label" label="Choose a direction" renderValue={(value)=>
					<div className="flex">
					<div className="flex-grow"><Typography variant="caption">{value}</Typography></div>
					{(loading) && <CircularProgress size={20}/> }
					</div>
				}>
					{Object.keys(moas_reorganized[currentTerm]).map((direction) => (
						<MenuItem key={direction} sx={{backgroundColor:'transparent'}}>
							<Link href={`/moa_atlas?q=${JSON.stringify({"min_lib":3, "direction": direction, "term": currentTerm, "zscore": 5, "search":true, "limit": 50})}`}>
							<Button sx={{color: "black"}} onClick={(e)=>{
								// e.preventDefault()
								setLoading(true)	
								timer.current = setTimeout(()=>{
									const query = {
										q: JSON.stringify({"min_lib":3, "direction": direction, "term": currentTerm, "zscore": 5, "search":true, "limit": 50})
									}
									console.log("refreshing", query)
									router_push(router, pathname, query)
								}, 12000)							
							}}>
								{direction}, {moas[direction][currentTerm].length} genes
							</Button> 
							</Link>
						</MenuItem>
					))}
				</Select>
				</FormControl>
                    </Stack>
			</Grid>
		</>
	)
}