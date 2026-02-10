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



export const CancerTypeSelector = ({cancer_gmt, group_name,  info, term, elements}: 
	{cancer_gmt: {[key:string]: {[key: string] : string[]}}, 
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
	const currentType = group_name
	
	useEffect(()=>{
			if (timer.current) clearTimeout(timer.current)
			setLoading(false)
		}, [elements])
	for (const major_type of ((Object.keys(cancer_gmt)))) {
		let active = major_type === currentType ? true : false
		icon_buttons.push(
			<Link href={`/cancer_atlas?q=${JSON.stringify({"min_lib":3, "group_name": major_type, "term": Object.keys(cancer_gmt[currentType])[0], "zscore": 5, "search":true, "limit": 50})}`}>
			<Button key={major_type} sx={active ? activeStyle : buttonStyle} onClick={()=>{
				setLoading(true)
				setClicked(major_type)
				timer.current = setTimeout(()=>{
					const query = {
						q: JSON.stringify({"min_lib":3, "group_name": major_type, "term": Object.keys(cancer_gmt[currentType])[0], "zscore": 5, "search":true, "limit": 50})
					}
					console.log("refreshing", query)
					router_push(router, pathname, query)
				}, 12000)
				
			}}>
				<Image
					src = {`/cancers/${major_type}.png`}
					style={{objectFit: "contain"}}
					alt = {`${major_type}`}
					width={100}
					height={100}
					aria-label={`${major_type}`}

				/>
				{(loading && major_type === clicked) && <CircularProgress sx={{position: "absolute", objectFit: "contain"}}/> }
			</Button>
			</Link>
		)

	}
	return (
		<>
		<Grid container display={'grid'} gridTemplateColumns={"repeat(3, 1fr)"} spacing={2}>
				{icon_buttons}
			</Grid>
			<Grid>
			<Stack direction='column' spacing={3} sx={{justifyContent: 'center', alignContent:'center'}}>
			<FormControl fullWidth>

				<InputLabel id="labelID">Choose a <b>{currentType}</b> subtype</InputLabel>
				<Select fullWidth value={term} labelId="labelID" id="label" label="Choose a subtype" renderValue={(value)=>
					<div className="flex">
					<div className="flex-grow"><Typography variant="caption">{value}</Typography></div>
					{(loading) && <CircularProgress size={20}/> }
					</div>
				}>
					{Object.keys(cancer_gmt[currentType]).map((type) => (
						<MenuItem key={type} sx={{backgroundColor:'transparent'}}>
							<Link href={`/cancer_atlas?q=${JSON.stringify({"min_lib":3, "group_name": currentType, "term": type, "zscore": 5, "search":true, "limit": 50})}`}>
							<Button sx={{color: "black"}} onClick={(e)=>{
								setLoading(true)	
								timer.current = setTimeout(()=>{
									const query = {
										q: JSON.stringify({"min_lib":3, "group_name": currentType, "term": type, "zscore": 5, "search":true, "limit": 50})
									}
									console.log("refreshing", query)
									router_push(router, pathname, query)
								}, 12000)							
							}}>
								{type}, {cancer_gmt[currentType][type].length} genes
							</Button> 
							</Link>
						</MenuItem>
					))}
				</Select>
				</FormControl>
				

                    <Link target="_blank" rel="noopener noreferrer" href={info[`${currentType}:Subtype 0`].m2t_url}> 
                        <Button
							size="small"
							variant="contained"
							color='primary'
							sx={{
								alignContent: 'center',
								padding: "2px 1px",
								// marginTop: "20px"
							}}
                        >
                            <Typography> View the <b>{currentType}</b> report in Multiomics2Targets </Typography>

                            <Image src={'/img/m2t_logo.png'} alt={"Multiomics2Targets"} width={75} height={75} />
                        </Button>
                    
                    </Link>
                    </Stack>
			</Grid>
		</>
	)
}