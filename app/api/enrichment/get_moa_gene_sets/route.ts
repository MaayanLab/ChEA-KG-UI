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
        // const res = await fetch("file://consensus_top_30_moa.gmt")
        
        const filePath = path.join(
                process.cwd(),
                "public",
                "consensus_top_30_moa.gmt"
            )

        const res = await readFile(filePath, "utf8")
        console.log("result:", res)
    // if (!res.ok) throw new Error("Couldn't get moa atlas data")
    if (!res) throw new Error("Couldn't get moa atlas data")
    else {
        // const moa_atlas = await res.text()
        const moa_atlas = await res
        const moas = {}
        for (const i of moa_atlas.split("\n").sort()) {
            const [name, _, ...gene_sets] = i.split("\t")
            const [direction, moa] = name.split(":")
            if (direction !== "" && direction !== 'Undefined') {
                if (moas[direction] === undefined) moas[direction] = {}
                moas[direction][moa] = gene_sets
            }
        }
        console.log("moas", moas)
        cache.put("moa_atlas_gmt", moas, 10000);
        return NextResponse.json(moas, {status: 200})
        }   
    }
}