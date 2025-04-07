import { 
	Grid,
	MenuItem,
	Stack,
	Select,
	InputLabel,
	FormControl,
	Typography
} from "@mui/material";
import dynamic from "next/dynamic";
import React, { useState } from 'react';
import Link from "next/link";
import Image from "next/image";

const Button = dynamic(() => import('@mui/material/Button'));


const styles = {
	enabled: {
		opacity: 1,
    	borderRadius: "5px",
		"&:hover": {
			border: 1,
			borderRadius: "5px",
		}
	},
	active: {
		opacity: 1,
		border: 1,
		borderRadius: "5px",
		boxShadow: "1",
	}
  }



export const CancerTypeSelector = ({cancer_types, group_name,  info}: 
	{cancer_types: {[key:string]: {[key: string] : string[]}}, 
	group_name:string,
	info: {[key:string]: {[key: string] : string}}}) => 
		{
	const [currentType, setCurrentType] = useState(group_name)

	const handleType = (event, button) =>{
		setCurrentType(button)

	}

	let icon_buttons = []
	let buttonStyle = styles.enabled
	let activeStyle = styles.active
	for (const i of ((Object.keys(cancer_types)))) {
		let active = i === currentType ? true : false
		icon_buttons.push(
			// <Grid item key={i} sx={{mx:1}} xs={4} sm={3} md={2}>
				<Button sx={active ? activeStyle : buttonStyle} onClick={(e) => handleType(e, i)}>
					<Image
						src = {`/cancers/${i}.png`}
						//layout="responsive"
						objectFit="contain"
						alt = {`${i}`}
						width={100}
						height={100}
						aria-label={`${i}`}

					/>

				</Button>
					
			// </Grid>
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
				<Select fullWidth labelId="labelID" id="label" label="Choose a subtype">
					{Object.keys(cancer_types[currentType]).map((type) => (
						<Link href=	{`/cancer_atlas?q={"min_lib":3, "group_name": "${currentType}", "term": "${type}", "zscore": 5, "search":true, "limit": 50}`}>
							<MenuItem sx={{backgroundColor:'transparent'}}>
									{type}, {cancer_types[currentType][type].length} genes
							</MenuItem>
						</Link> 
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