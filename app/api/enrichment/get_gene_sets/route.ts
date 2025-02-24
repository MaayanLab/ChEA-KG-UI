import cache from "memory-cache";
import { NextResponse } from "next/server";

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
    
    let cell_marker = cache.get("cell_marker")
    if (!cell_marker) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_PREFIX}/CellMarker_Augmented_2021.gmt`)
        if (!res.ok) throw new Error("Couldn't get Cell Marker data")
        else {
            cell_marker = await res.text()
        }
    }
    const cell_types = {}
    for (const i of cell_marker.split("\n")) {
        const [name, _, ...gene_sets] = i.split("\t")
        const group = name.split(":")[1]
        if (group !== "" && group !== 'Undefined') {
            if (cell_types[group] === undefined) cell_types[group] = {}
            cell_types[group][name] = gene_sets
        }
    }
    return NextResponse.json(cell_types, {status: 200})
}