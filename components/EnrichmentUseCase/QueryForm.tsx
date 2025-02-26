'use client'
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import Tooltip from '@mui/material/Tooltip';
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
import { CellTypeForm } from './CellTypeForm';
import FlexSearch from 'flexsearch';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const QueryForm = ({
    cell_types,
    parsedParams,
    elements,
}: {
    elements: NetworkSchema,
    parsedParams: EnrichmentParams,
	cell_types: {[key:string]: {[key: string] : string[]}},
}) => {
    const router = useRouter()
    const [query, setQuery] = useQueryState('query', parseAsJson<EnrichmentParams>().withDefault({}))
        
    const pathname = usePathname()
    const [input, setInput] = useState<{genes: Array<string>, description: string}>({genes: [], description: ''})
    const [verified, setVerified] = useState<Array<string>>([])
    const [inputError, setInputError] = useState<boolean>(false)
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [controller, setController] = useState<AbortController>(null)
    const [error, setError] = useState<{message: string, type: string}>(null)
	const [index, setIndex] = useState(null)
	const [showGeneSet, setShowGeneSet] = useState(false)
	const [fullTextQuery, setFullTextQuery] = useState('')
	const [cellTypes, setCellTypes] = useState(cell_types)
	const [limit, setLimit] = useState(15)
    const combined_query = {...parsedParams, ...query}
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
    
    const prevInput = usePrevious(input) || {genes: [], description: ''}
    const same_prev_input = async () => {
        if (!userListId) return false
        let counter = 0
        while (counter < 5) {
            const request = await fetch(`${process.env.NEXT_PUBLIC_ENRICHR_URL}/view?userListId=${userListId}`)
            if (! request.ok && counter === 4) {
                setError({message: "Error resolving previous input. Try again in a while.", type: "fail"})
            }
            else if (! request.ok && counter < 4) {
                setError({message: `Error resolving previous input. Trying again in ${counter + 5} seconds...`, type: "retry"})
                await delay((counter + 5)*1000)
            } 
            else {    
                const {genes, description=''} = await request.json()
                setError(null)
                if (genes.join("\n") !== input.genes.join('\n')) return false
                if (description !== input.description) return false
                if (prevInput.genes.join('\n')!==input.genes.join('\n')) return false
                if (prevInput.description !== input.description) return false
                else return true
            }
            counter = counter + 1
        }
    }
    const addList = async () => {
        try {
            setLoading(true)
            const formData = new FormData();
            // const gene_list = geneStr.trim().split(/[\t\r\n;]+/).join("\n")
            const {genes, description=''} = input
            const gene_list = genes.join("\n")
            formData.append('list', gene_list)
            formData.append('description', description)
            const controller = get_controller()
            const {userListId}:{userListId:string} = await (
                await fetch(`${process.env.NEXT_PUBLIC_ENRICHR_URL}/addList`, {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                })
            ).json()
            const query = {...combined_query}
            // if (query.libraries === undefined) query.libraries = JSON.stringify(default_options.libraries)
            // setSubmitted(false)
            const {augment, augment_limit, gene_links, ...rest} = query
            router_push(router, pathname, {
                q: JSON.stringify({
                    ...rest,
                    userListId: `${userListId}`,
                    search: true
                })
            })
        } catch (error) {
            console.error(error)
        }
    }

    const verifyList = async (input: Array<string>) => {
        try {
            setLoading(true)
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
        const cell_type_index = new FlexSearch.Index()
        for (const [k, v] of Object.entries(cell_types)) {
            for (const key of Object.keys(v)) {
                const id = `${k},${key}`
                cell_type_index.add(id, `${k}:${key}`)
            }
        }
		setIndex(cell_type_index)
    },[cell_types])
	
    useEffect(()=>{
        setLoading(false)
    },[verified])

    useEffect(()=>{
        setLoading(false)
        setQuery(null)
    }, [elements])

    useEffect(()=> {
        const resolve_genes = async () => {
            let counter = 0
            while (counter < 5) {
                const request = await fetch(`${process.env.NEXT_PUBLIC_ENRICHR_URL}/view?userListId=${userListId}`)
                if (! request.ok && counter === 4) {
                    setError({message: "Error resolving genes. Try again in a while.", type: "fail"})
                }
                else if (! request.ok && counter < 4) {
                    setError({message: `Error resolving genes. Trying again in ${counter + 5} seconds...`, type: "retry"})
                    await delay((counter + 5)*1000)
                } 
                else {
                    const {genes, description} = await request.json()
                    setError(null)
                    setInput({
                        genes,
                        description
                    })
                    break
                }
                counter = counter + 1
            }
        }
        if (userListId) {
            resolve_genes()
        } else {
            setInput({genes: [], description: ''})
        }
        // setCollapsed(userListId!==undefined)
    }, [userListId])


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
        if (input.genes.length === 0) setVerified([])
        else verifyList(input.genes.map(i=>i.toUpperCase()))
    }, [input.genes])

	useEffect(()=>{
        if (term && group_name) {
			setInput({
				genes: cell_types[group_name][term],
				description: term
			})
		}
    }, [term])

    useEffect(()=>{
		if (index) {
			if (fullTextQuery === '') setCellTypes(cellTypes)
			else {
				const new_vals = {}
				for (const key of index.search(`*${fullTextQuery}*`)) {
					const [group_name, label] = key.split(",")
					if (new_vals[group_name] === undefined) new_vals[group_name] = {}
					new_vals[group_name][label] = cell_types[group_name][label]
				}
				setCellTypes(new_vals)
			}
		}
    }, [fullTextQuery])
    return (
        <FormGroup>
            <Snackbar open={error!==null}
					anchorOrigin={{ vertical:"bottom", horizontal:"left" }}
					autoHideDuration={4500}
					onClose={()=>{
                        if ((error || {} ).type === "fail") {
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
                            if ((error || {} ).type === "fail") {
                                router_push(router, pathname, {})
                                setQuery(null)
                                setError(null)
                            } else {
                                setError(null)
                            }
                        }}
                        severity={(error || {} ).type === "fail" ? "error": "warning"}
                        sx={{ width: '100%' }} 
                        variant="filled"
                        elevation={6}
                    >
                        <Typography>{( error || {}).message || ""}</Typography>
                    </Alert>
                </Snackbar>
            <Grid container spacing={2}>
				<Typography variant="body1" sx={{marginLeft: 2}}>
					View the transcription factor network of cell type specific gene sets from <Link target="_blank" rel="noopener noreferrer" color="secondary" href="https://maayanlab.cloud/Enrichr">Enrichr</Link> cell type gene sets.
				</Typography>
				<Grid item xs={12}>
					<TextField
						variant='outlined'
						value={fullTextQuery}
						size="small"
						onChange={e=>{
							setFullTextQuery(e.target.value)
						}}
						placeholder="Enter Organ, Tissue, or Cell Type"
						label="Enter Organ, Tissue, or Cell Type"
						sx={{width: "100%", backgroundColor: "#FFF"}}
						InputProps={{
							style: {
								fontSize: 14,
							},
							}}
					/>
                </Grid>
				{ (userListId || term ) && 
					<Grid item xs={12} className='flex justify-center'>		
						<Button variant="outlined" color="secondary" onClick={()=>setShowGeneSet(!showGeneSet)}>
							{showGeneSet ? "Hide": "Show"} Input Gene Set
						</Button>
					</Grid>
				}
				{showGeneSet &&
					<Grid item xs={12} md={12}>
						<Grid container alignItems={"center"} spacing={1}>
							<Grid item xs={12}>
								<div tabIndex={0}>
									{!isFocused ? 
										<Card sx={{height: 235, overflowY: "auto", boxShadow: "none", border: "1px solid black"}} onClick={() => setIsFocused(true)}>
											{input.genes.length === 0 && <Typography variant="subtitle2" align='left' sx={{paddingLeft: 1, paddingTop: 2, fontSize: 13.75, color: "#bdbdbd"}}>Paste a set of valid Entrez gene symbols (e.g. STAT3) on each row in the text-box</Typography> }
											<CardContent>
												{input.genes.map(i=>{
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
											value={input.genes.join("\n")}
											onChange={(e)=>{
												setInput({
													...input,
													genes: e.target.value.split(/[\t\r\n;]+/)
												})
											}}
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
							<Grid item xs={12} sx={{textAlign: "left"}}>
								<Stack direction={"row"} spacing={1} alignItems="center">
									<Tooltip title={input.genes.length === 0 ? "Input gene set": loading ? "Loading...": "Submit"}>
										<Button 
											onClick={async ()=>{
												// setSubmitted(true)
												if (!(await same_prev_input())) {
													if (input.genes.length > 0) {
														addList()
													}
												} else {
													const {search, augment, augment_limit, gene_links, ...rest} = combined_query
													// setSubmitted(false)
													router_push(router, pathname, {
														q: JSON.stringify({
															...rest,
															search: true
														})
													})
												}
											}}
											disabled={loading || input.genes.length === 0}
											size="large"
											variant="contained"
											sx={{
												padding: "15px 30px"
											}}
											// disabled={input.genes.length === 0}
										>{loading ? "Searching...": "Submit"}</Button>
									</Tooltip>
									{(verified.length > 0 && input.genes.length > 0) && <Tooltip title="Matched genes"><Button onClick={()=>setIsFocused(false)}><Typography color={'secondary'} variant='subtitle2'> {`${verified.length} matched genes`}</Typography></Button></Tooltip>}
								</Stack>
							</Grid>
							<Grid item sx={{ flexGrow: 1, marginTop: 3 }}>
								<TextField
									variant='outlined'
									value={input.description}
									size="small"
									onChange={e=>setInput({...input, description: e.target.value})}
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
						</Grid>
					</Grid>
				}
				<Grid item xs={12}>
					<CellTypeForm cell_types={cellTypes} limit={limit}/>
				</Grid>
				{ Object.keys(cellTypes).length > 15 && <Grid item xs={12} className='flex justify-center space-x-5'>
						<Button variant="outlined" color="secondary" onClick={()=>{
							if (limit === Object.keys(cellTypes).length) {
								setLimit(15)
							} else {
								const new_limit = limit + 10
								if (new_limit > Object.keys(cellTypes).length) {
									setLimit(Object.keys(cellTypes).length)
								} else {
									setLimit(new_limit)
								}
							}
						}}>
							Show {limit === Object.keys(cellTypes).length ? "Less": "More"}
						</Button>
						{limit !== Object.keys(cellTypes).length && <Button variant="outlined" color="secondary" onClick={()=>{
							setLimit(Object.keys(cellTypes).length)
						}}>
							Show All
						</Button>
						}
				</Grid>
			}
            </Grid>
        </FormGroup>
    )
}

export default QueryForm