import React from "react";
import Link from "next/link";
import {
    Grid,
    Stack,
    Typography,
    Card,
    CardContent
} from "@mui/material";
import TermViz from "@/components/Chea3Enrichment/TermViz";
import { NetworkSchema } from "@/app/api/knowledge_graph/route";
import { parseAsJson } from "next-usequerystate";
import InteractiveButtons from "@/components/Chea3Enrichment/InteractiveButtons";
import { fetch_kg_schema } from "@/utils/initialize";
import TooltipComponentGroup from "../TermAndGeneSearch/tooltip";
import { CellTypeForm } from "./CellTypeForm";
import QueryForm from "./QueryForm";
export interface EnrichmentParams {
    group_name?: string,
    userListId?: string,
    term?: string,
    term_limit?: number,
    gene_limit?: number,
    min_lib?: number,
    gene_degree?: number,
    term_degree?: number,
    augment?: boolean,
    augment_limit?: number,
    gene_links?: Array<string>,
    search?: boolean,
    expand?: Array<string>,
    remove?: Array<string>,
    additional_link_tags?: Array<string>,
    pvalue?: number,
    zscore?: number,
    add_nodes?: number
}


const Enrichment = async ({
    libraries: l,
    sortLibraries,
    searchParams,
    endpoint,
    ...props
}: {
    example?: {
        gene_set?: string,
    },
    libraries?: Array<{name: string, node: string, regex?: string}>,
    sortLibraries?: boolean,
    disableLibraryLimit?: boolean,
    disableHeader?: boolean,
    title?: string,
    description?: string,
    searchParams: {
        q?:string,
        fullscreen?: "true",
        view?: string,
        collapse?: "true"
    },
    endpoint: string,
    additional_link_relation_tags?: Array<string>

}) => {
    
    const query_parser = parseAsJson<EnrichmentParams>()
    console.log("Getting schema...")
    const schema = await fetch_kg_schema()
    console.log("Schema fetched")
    const libraries_list = sortLibraries ? l.sort(function(a, b) {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
     }): l


    const tooltip_templates_node = {}
    const tooltip_templates_edges = {}
    for (const i of schema.nodes) {
        tooltip_templates_node[i.node] = i.display
    }

    for (const e of schema.edges) {
        for (const i of e.match) {
        tooltip_templates_edges[i] = e.display
        }
    }
    const hiddenLinksRelations = schema.edges.reduce((acc, i)=>{
        if (i.hidden) return [...acc, ...i.match]
        else return acc
    }, [])
    
    const parsedParams: EnrichmentParams = query_parser.parseServerSide(searchParams.q) || {}
    //console.log("to remove1", typeof parsedParams.remove[0])
    
    try {
        const cell_types = await (await fetch(`${process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_PREFIX ? process.env.NEXT_PUBLIC_PREFIX: ""}/api/enrichment/get_gene_sets`)).json()
        const libraries = [{"library":"Integrated--meanRank","term_limit":10}]
        
        const {
            term,
            group_name,
            gene_limit,
            min_lib,
            gene_degree,
            term_degree,
            expand = [],
            remove = [],
            augment_limit,
            gene_links,
            pvalue,
            zscore, 
            add_nodes
        } = parsedParams
        let elements:NetworkSchema = null
        let shortId = ""
        let min_p = 1
        let max_p = 0
        let min_z = 100
        let max_z = 0
        let input_desc
        let userListId = parsedParams.userListId
        if (term !==undefined && group_name !== undefined) {
            const formData = new FormData();
            // const gene_list = geneStr.trim().split(/[\t\r\n;]+/).join("\n")
            const genes = cell_types[group_name][term]
            const gene_list = genes.join('\n')
            formData.append('list', gene_list)
            formData.append('description', term)
            userListId = await (
                await fetch(`${process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_PREFIX ? process.env.NEXT_PUBLIC_PREFIX: ""}/api/enrichment/addList`, {
                    method: 'POST',
                    body: formData,
                })
            ).json()
        }
        // console.log("to remove", typeof parsedParams.remove[0])
        if (userListId !==undefined) {
            //const request = await fetch(`${process.env.NEXT_PUBLIC_ENRICHR_URL}/share?userListId=${userListId}`)
            //if (request.ok) shortId = (await (request.json())).link_id
            //else console.log(`${process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_PREFIX ? process.env.NEXT_PUBLIC_PREFIX: ""}/api/enrichment/view?userListId=${userListId}`)
            shortId = userListId
            console.log(`Enrichment ${process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_PREFIX ? process.env.NEXT_PUBLIC_PREFIX: ""}/api/enrichment${parsedParams.augment===true ? "/augment": ""}`)
            const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_PREFIX ? process.env.NEXT_PUBLIC_PREFIX: ""}/api/enrichment${parsedParams.augment===true ? "/augment": ""}`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        userListId,
                        libraries,
                        min_lib,
                        gene_limit,
                        gene_degree,
                        term_degree,
                        expand,
                        remove,
                        augment_limit,
                        gene_links,
                        pvalue,
                        zscore,
                        add_nodes
                    }),
                })
            if (!res.ok) {
                console.log(`failed connecting to ${process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_PREFIX ? process.env.NEXT_PUBLIC_PREFIX: ""}/api/enrichment${parsedParams.augment===true ? "/augment": ""}`)
                console.log(await res.text())
            }
            else{
                console.log(`fetched`)
                elements = await res.json()
                
                for (const i of (elements || {}).edges) {
                    if (typeof i.data.p_value == 'number' && min_p > i.data.p_value) min_p = i.data.p_value
                    if (typeof i.data.p_value == 'number' && max_p < i.data.p_value) max_p = i.data.p_value
                    if (typeof i.data.z_score == 'number' && min_z > i.data.z_score) min_z = i.data.z_score
                    if (typeof i.data.z_score == 'number' && max_z < i.data.z_score) max_z = i.data.z_score
                    
                }
            }
        }
        const payload = {
            "url": `${process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_PREFIX ? process.env.NEXT_PUBLIC_PREFIX: ""}${endpoint}?q=${searchParams.q}`,
            "apikey": process.env.NEXT_PUBLIC_TURL  
        }
        console.log("Getting short url")
        const request = await fetch(process.env.NEXT_PUBLIC_TURL_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
        let short_url=null
        if (request.ok) short_url = (await request.json())["shorturl"]
        else console.log("failed turl")
        console.log("Got url")
        return (
            <Grid container spacing={1} alignItems={"flex-start"}>
                <Grid item xs={12}>
                    <Typography variant={"h2"}>{props.title || "Enrichment Analysis"}</Typography>
                    {/* { props.disableHeader ? <Typography variant={"subtitle1"}>Enter a set of Entrez gene symbols below to perform transcription factor enrichment analysis using&nbsp;
                            <Link href={"https://maayanlab.cloud/chea3/"} 
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{color: "black", textDecoration: "underline"}}
                            >
                                <span style={{fontSize: 16, fontWeight: 700, fontFamily: "Rubik, sans-serif"}}>ChEA3</span>
                            </Link>. The result is a subnetwork of the ChEA-KG GRN, made of the top {add_nodes} mean-ranked transcription factors enriched for the query set.</Typography>:
                        <Typography variant="subtitle1" sx={{marginBottom: 3}}>Submit your gene set for enrichment analysis with &nbsp;
                            <Link href={shortId ? `https://maayanlab.cloud/Enrichr/enrich?dataset=${shortId}` : "https://maayanlab.cloud/Enrichr/"} 
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{color: "black", textDecoration: "none"}}
                            >
                                <span style={{fontSize: 20, fontWeight: 500, letterSpacing: "0.1em"}}>En</span><span style={{color: "red", fontSize: 20, fontWeight: 500, letterSpacing: "0.1em"}}>rich</span><span style={{fontSize: 20, fontWeight: 500, letterSpacing: "0.1em"}}>r</span>
                            </Link>
                        </Typography>
                    } */}
                </Grid>
                <Grid item xs={12} md={3}>
                    <QueryForm parsedParams={parsedParams} elements={elements} cell_types={cell_types}/>
                </Grid>
                <Grid item xs={12} md={9}>
                    {elements === null ?
                        <Typography>Select a gene set</Typography>:
                        <Stack direction={"column"} alignItems={"flex-start"} spacing={1}>
                            <InteractiveButtons 
                                hiddenLinksRelations={hiddenLinksRelations}
                                shortId={shortId}
                                parsedParams={parsedParams}
                                // searchParams={parsedParams}
                                fullscreen={searchParams.fullscreen}
                                elements={elements}
                                short_url={short_url}
                                additional_link_relation_tags={props.additional_link_relation_tags}
                                min_p={min_p}
                                max_p={max_p}
                                min_z={min_z}
                                max_z={max_z}
                            />
                            
                            <Card sx={{borderRadius: "24px", minHeight: 450, width: "100%"}}>
                                <CardContent>
                                    {input_desc && 
                                        <Typography variant="h5" sx={{textAlign: "center"}}><b>{input_desc}</b></Typography>
                                    }
                                    <TermViz
                                        elements={elements} 
                                        /*enrichment_results = {enrichment_results}*/
                                        schema={schema}
                                        tooltip_templates_edges={tooltip_templates_edges}
                                        tooltip_templates_nodes={tooltip_templates_node}
                                    />
                                </CardContent>
                            </Card>
                        </Stack>
                    }
                </Grid>
            </Grid>
        )
    } catch (error) {
        console.error(error)
        return null
    }
}

export default Enrichment