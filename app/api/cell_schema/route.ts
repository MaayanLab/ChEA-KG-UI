import cache from "memory-cache";
import { fetch_cellatlas_schema } from "@/utils/initialize"
import { NextResponse } from "next/server";

export interface AtlasSchema{
    celltype: Array<{
            type:string,
            tissue: string,
            term: string,
            library: string
        
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
    const cached = cache.get("cellschema")
    if (cached) {
        return NextResponse.json(cached, {status: 200})
    } else {
        const cellschema = await fetch_cellatlas_schema()
        cache.put("cellschema", cellschema, 10000);
        return NextResponse.json(cellschema, {status: 200})
    }
    // const schema = await fetch_kg_schema()
    //     // cache.put("schemaz", schema, 10000);
    // return NextResponse.json(schema, {status: 200})
}