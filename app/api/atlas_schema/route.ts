import cache from "memory-cache";
import { fetch_atlas_schema } from "@/utils/initialize"
import { NextResponse } from "next/server";

export interface AtlasSchema{
    celltype: Array<{
            type:string,
            tissue: string,
            term: string,
            library: string,
            url: string
        
    }>,
    cancertype: Array<{
        term:string,
        type: string,
        tissue: string,
        enrichr_url: string,
        m2t_url: string
    
}>
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
    const cached = cache.get("atlasschema")
    if (cached) {
        console.log("atlasschema")
        return NextResponse.json(cached, {status: 200})
    } else {
        const atlasschema = await fetch_atlas_schema()
        console.log("atlasschema")
        cache.put("atlasschema", atlasschema, 10000);
        return NextResponse.json(atlasschema, {status: 200})
    }
    // const schema = await fetch_kg_schema()
    //     // cache.put("schemaz", schema, 10000);
    // return NextResponse.json(schema, {status: 200})
}