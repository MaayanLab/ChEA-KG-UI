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
    const cached = cache.get("moa_atlas_gmt")
    console.log("attempting to get gmt file...")
    if (cached) {
        console.log("file is cached")
        return NextResponse.json(cached, {status: 200})
    } else {
        console.log("attempting to get gmt file...")
        const res = await fetch("http://s3.amazonaws.com/maayan-kg/chea-kg/l1000_consensus_top_30_moa.gmt")
    if (!res.ok) throw new Error("Couldn't get direction atlas data")
    else {
        const moa_atlas = await res.text()
        const moas = {}
        for (const i of moa_atlas.split("\n").sort()) {
            const [name, _, ...gene_sets] = i.split("\t")
            const [moa, direction] = name.split(":")
            if (moa !== "" && moa !== 'Undefined') {
                if (moas[moa] === undefined) moas[moa] = {}
                moas[moa][direction] = gene_sets
            }
        }
        cache.put("moa_atlas_gmt", moas, 10000);
        return NextResponse.json(moas, {status: 200})
        }   
    }
}