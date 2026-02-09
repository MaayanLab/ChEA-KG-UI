'use client'
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { router_push, usePrevious } from '@/utils/client_side';
import { delay } from '@/utils/helper';
import Button from '@mui/material/Button'

import Typography from '@mui/material/Typography'

import Grid from '@mui/material/Grid';
import ErrorIcon from '@mui/icons-material/Error';
import { 
    Card, 
    CardContent,  
    FormGroup, 
    Stack, 
    TextField,
    Snackbar,
    Alert,
	Link,
} from '@mui/material';
import { NetworkSchema } from '@/app/api/knowledge_graph/route';
import { useQueryState, parseAsJson } from 'next-usequerystate';
import { EnrichmentParams } from '.';
import { MOASelector } from './MOASelector';
import FlexSearch from 'flexsearch';
import { useWidth } from '../Chea3Enrichment/form';

const QueryForm = ({
    moa_gmt,
    moa_info,
    parsedParams,
    elements,
    description,
    genes,
}: {
    description?: string,
    elements: NetworkSchema,
    parsedParams: EnrichmentParams,
    moa_info: {[key:string]: {[key: string] : string}},
	moa_gmt: {[key:string]: {[key: string] : string[]}},
    genes: string[]
}) => {
    const router = useRouter()
    const [query, setQuery] = useQueryState('query', parseAsJson<EnrichmentParams>().withDefault({}))
        
    const pathname = usePathname()
    const [verified, setVerified] = useState<Array<string>>([])
    const [inputError, setInputError] = useState<boolean>(false)
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const [controller, setController] = useState<AbortController>(null)
    const [error, setError] = useState<{message: string, types: string}>(null)
	const [index, setIndex] = useState(null)
	const [showGeneSet, setShowGeneSet] = useState(false)
	const [fullTextQuery, setFullTextQuery] = useState('')
	const [moaTypes, setMoaTypes] = useState(moa_gmt)
	const [limit, setLimit] = useState(15)
    const [v, setValue] = useState<string>('1')
    const [formVisibility, setFormVisibility] = useState(false)
    const combined_query = {...parsedParams, ...query}
    const width = useWidth()
    const {
        userListId,
		term,
		group_name,
    } = combined_query

    const get_controller = () => {
        if (controller) controller.abort()
        const c = new AbortController()
        setController(c)
        return c
      }
    
    
    const verifyList = async (input: Array<string>) => {
        try {
            const controller = get_controller()
            const verified:Array<string> = await (
                await fetch(`${process.env.NEXT_PUBLIC_PREFIX ? process.env.NEXT_PUBLIC_PREFIX: ''}/api/enrichment/terms_and_genes`, {
                    method: 'POST',
                    body: JSON.stringify({
                        input
                    }),
                    signal: controller.signal
                })
            ).json()
            setVerified(verified)
        } catch (error) {
            console.error(error)
        }
    }

	useEffect(()=>{
        const subtypes_index = new FlexSearch.Index()
        for (const [k, v] of Object.entries(moa_gmt)) {
            for (const key of Object.keys(v)) {
                const id = `${k},${key}`
                subtypes_index.add(id, `${k}:${key}`)
            }
        }
		setIndex(subtypes_index)
    },[moa_gmt])
	

    useEffect(()=>{
        if ((width === 'xs' || width == 'sm') && elements) setFormVisibility(false)
        else setFormVisibility(true)
    },[width, elements])
        
    useEffect(()=>{
        setQuery(null)
    }, [elements])

    

    useEffect(()=>{
        const delayed_reset = async () => {
            await delay(1000)
            setInputError(false)
        }
        if (inputError) {
            delayed_reset()
        }
    }, [inputError])

    useEffect(()=>{
        if (genes.length === 0) setVerified([])
        else verifyList(genes)
    }, [genes])

	

    useEffect(()=>{
		if (index) {
			if (fullTextQuery === '') setMoaTypes(moaTypes)
			else {
				const new_vals = {}
				for (const key of index.search(`*${fullTextQuery}*`)) {
					const [group_name, label] = key.split(",")
					if (new_vals[group_name] === undefined) new_vals[group_name] = {}
					new_vals[group_name][label] = moa_gmt[group_name][label]
				}
				setMoaTypes(new_vals)
			}
		}
    }, [fullTextQuery])

 
    if (!formVisibility) return <Button color="secondary" variant="outlined" onClick={()=>setFormVisibility(!formVisibility)}>{formVisibility ? 'Hide' : 'Show'} Form</Button>
    return (
        <FormGroup>
            <Snackbar open={error!==null}
					anchorOrigin={{ vertical:"bottom", horizontal:"left" }}
					autoHideDuration={4500}
					onClose={()=>{
                        if ((error || {} ).types === "fail") {
                            router_push(router, pathname, {})
                            setQuery(null)
                            setError(null)
                        } else {
                            setError(null)
                        }
                    }}
				>
                    <Alert 
                        onClose={()=>{
                            if ((error || {} ).types === "fail") {
                                router_push(router, pathname, {})
                                setQuery(null)
                                setError(null)
                            } else {
                                setError(null)
                            }
                        }}
                        severity={(error || {} ).types === "fail" ? "error": "warning"}
                        sx={{ width: '100%' }} 
                        variant="filled"
                        elevation={6}
                    >
                        <Typography>{( error || {}).message || ""}</Typography>
                    </Alert>
                </Snackbar>
            <Grid container spacing={2}>
				<Typography variant="body1" sx={{marginLeft: 2}}>
					{description}
				</Typography>
				
                    <Box>
                        <Tabs
                            value ={v===null? "1" : v}
                            onChange={(e, newValue)=>{
                                setValue(newValue)
                            }} 
                            aria-label="label"
                            sx={{textColor: 'black'}}
                            textColor='secondary'
                            indicatorColor='secondary'
                        >
                            <Tab 
                            value = "1"
                            label="Choose network"
                            title="Choose a consensus moa network"
                            // sx={{color: 'black', variant:'normal', fontSize:14}}
                            wrapped
                            />
                            <Tab 
                            value='2'
                            label="View gene set" 
                            title="View the consensus moa gene set"
                            // sx={{color: 'black', variant:'normal', fontSize:14}}
                            wrapped
                            />
                        </Tabs>
                    </Box>
                    {(v === "2") && <Grid item xs={12} md={12}>
						<Grid>
                        <Stack direction= "column" alignItems="center" justifyContent={'space-around'} spacing={2}>
                                <Grid sx={{width: "100%"}}>
                                    <div tabIndex={0}>
                                    <Typography sx={{textAlign:"center"}}> <b>{`${group_name}: ${term}`}</b> </Typography>

                                        {!isFocused ? 
                                            <Card sx={{height: 320, overflowY: "auto", boxShadow: "none", border: "1px solid black"}} onClick={() => setIsFocused(true)}>
                                                {genes.length === 0 && <Typography variant="subtitle2" align='left' sx={{paddingLeft: 1, paddingTop: 2, fontSize: 13.75, color: "#bdbdbd"}}>Paste a set of valid Entrez gene symbols (e.g. STAT3) on each row in the text-box</Typography> }
                                                <CardContent>
                                                    {genes.map(i=>{
                                                        if (verified.indexOf(i.toUpperCase()) > -1) return <Typography key={i} color="secondary" align='left' sx={{fontSize: 14}}>{i}</Typography>
                                                        else {
                                                            if (i === '') return null
                                                            else return <Stack direction='row' key={i} spacing={1} alignItems={"center"} justifyContent="flex-start"><Typography align='left' color={verified.length > 0 ? 'error': 'default'} sx={{fontSize: 14}}>{i}</Typography><ErrorIcon color="error" sx={{width: 15}}/></Stack>
                                                        }
                                                    })}
                                                </CardContent>
                                            </Card>:
                                            <TextField
                                                onBlur={() => setIsFocused(!isFocused)}
                                                multiline
                                                className='EnrichmentForm'
                                                rows={10}
                                                placeholder={"Paste a set of valid Entrez gene symbols (e.g. STAT3) on each row in the text-box"}
                                                fullWidth
                                                value={genes.join("\n")}                
                                                InputProps={{
                                                    sx: {
                                                        fontSize: 14,
                                                    },
                                                }}
                                                inputProps={{
                                                    sx: {
                                                        paddingRight: 0
                                                    }
                                                }}
                                            />
                                        }
                                    </div>
                                    
                                </Grid>
                                {/* <Grid alignContent={'center'}>
                                    <Link target="_blank" rel="noopener noreferrer" href={moa_info[`${group_name}:${term}`].enrichr_url}> 
                                        <Button
                                        size="small"
                                        variant="contained"
                                        color='primary'
                                        sx={{
                                            alignContent: 'center',
                                            padding: "3.5px 10px",
                                            // marginTop: "20px"
                                        }}
                                        ><Typography> View marker genes in <span style={{color: "black",fontSize: 20, fontWeight: 500, letterSpacing: "0.1em"}}>En</span><span style={{color: "red", fontSize: 20, fontWeight: 500, letterSpacing: "0.1em"}}>rich</span><span style={{color: "black",fontSize: 20, fontWeight: 500, letterSpacing: "0.1em"}}>r</span></Typography>
                                        </Button>
                                    
                                    </Link>

                                </Grid>  */}
                            </Stack>
                            
				            {showGeneSet &&
					
							<Grid item sx={{ flexGrow: 1, marginTop: 3 }}>
								<TextField
									variant='outlined'
									value={description}
									size="small"
									// onChange={e=>setInput({...input, description: e.target.value})}
									placeholder="Description"
									label="Description"
									sx={{width: "100%", backgroundColor: "#FFF"}}
									InputProps={{
										style: {
										fontSize: 14,
										},
									}}
								/>
							</Grid>
                            }
						</Grid>
					</Grid>
				}

				{(v === "1") && <Grid item xs={12} md={12}>
               <Stack direction="column" spacing={2} sx={{justifyContent:"flex-start", paddingTop:2}}>
					<MOASelector elements={elements} moa_gmt={moaTypes} group_name={group_name} term={combined_query.term} moa_info={moa_info}/>
                    
            </Stack>
            </Grid>}
            
            {['xs' , 'sm'].indexOf(width) > -1 && <Grid item xs={12}><Button color="secondary" variant="outlined" onClick={()=>setFormVisibility(!formVisibility)}>{formVisibility ? 'Hide' : 'Show'} Form</Button></Grid>}
            
            </Grid>
        </FormGroup>
    )
}

export default QueryForm