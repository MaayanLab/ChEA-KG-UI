import cache from "memory-cache";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises"
import path from "path"

export interface UISchema {
    nodes: Array<{
        node: string,
        example?: Array<string>,
        relation?: Array<string>,
        display: Array<{
            label: string,
            text: string,
            type: string
        }>,
        search?: Array<string>,
        color?: string,
        order?: Array<string>
        border_color?: string,
        ring_label?: string,
    }>,
    edges: Array<{
        match: Array<string>,
        selected?: boolean,
        templates?: {
            multiple?: string,
            singular?: string
        },
        edge_suffix?: string,
        display: Array<{
            label: string,
            text: string,
            type: string,
            href?:string,
        }>,
        hidden?: boolean,
        color?: string,
        order?: Array<string>,
        directed?: string
    }>,
    header: {
        title: string,
        header?: string,
        divider?: boolean,
        fullWidth?:boolean,
        counterTop?: boolean,
        counter?: boolean,
        icon: {
            src: string,
            favicon: string,
            faviconTitle?: string,
            alt: string,
            width: number,
            height: number,
            avatar?: boolean
        },
        tabs: Array<{
            endpoint: string,
            label: string,
            type: string,
            component: string,
            position?: string,
            props?: {
                subheader?: {
                    url_field: string,
                    query_field: string,
                },
                [key: string]: any
            }
        }>,
        subheader?: Array<{
            label: string,
            icon: string,
            height: number,
            width: number,
            props: {
                [key: string]: any
            },
            href?: string
        }>
    },
    ui_theme?: string,
    footer: {
        style?: {
            [key: string]: string | number
        },
        layout: Array<Array<
            {
                component: string,
                props?: {
                    [key:string]: string|number|boolean
                }
            }
        >>,
        footer_text?: string
    }
}

/**
 * @swagger
 * /api/schema:
 *   get:
 *     description: Returns the schema
 *     responses:
 *       200:
 *         description: UI Schema
 */
export async function GET() {
    const cached = cache.get("aging_atlas_gmt")
    


    if (cached) {
        console.log("file is cached")
        return NextResponse.json(cached, {status: 200})
    } else {
        console.log("attempting to get gmt file...")
        const filePath = path.join(
                process.cwd(),
                "public",
                "aging_atlas_gtex.gmt"
            )
        const res = await readFile(filePath, "utf8")
        console.log("result: ", res)
        
    if (!res) throw new Error("Couldn't get aging atlas data")
    else {
        const aging_atlas = await res
        const aging_terms = {}
        for (const i of aging_atlas.split("\n").sort()) {
            const [name, _, ...gene_sets] = i.split("\t")
            const [aging_term, direction] = name.split(":")
            if (aging_term !== "" && aging_term !== 'Undefined') {
                if (aging_terms[aging_term] === undefined) aging_terms[aging_term] = {}
                aging_terms[aging_term][direction] = gene_sets
            }
        }
        cache.put("aging_tissue_atlas_gmt", aging_terms, 10000);
        return NextResponse.json(aging_terms, {status: 200})
        }   
    }
}