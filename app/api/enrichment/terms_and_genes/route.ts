import { neo4jDriver } from "@/utils/neo4j"
import neo4j from "neo4j-driver"
import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server' 
import { z } from 'zod'

export const verify_input = async (input:Array<string>, convert:Boolean) => {
    try{
        const session = neo4jDriver.session({
            defaultAccessMode: neo4j.session.READ
        })
        try {
            const query = `MATCH (n)
                WHERE n.label IN ${JSON.stringify(input)}
                OR n.HGNC IN ${JSON.stringify(input)}
                OR n.Ensembl IN ${JSON.stringify(input)}
                RETURN n
            `
            
            const rs = await session.readTransaction(txc => txc.run(query))
            const valid = []
            rs.records.flatMap(record => {
                const node = record.get('n')
                const {label, HGNC, Ensembl} = node.properties
                let l:string 
                if (convert) l = label
                else l = input.indexOf(label) > -1 ? label: input.indexOf(HGNC) > -1 ? HGNC : input.indexOf(Ensembl) > -1 ? Ensembl: null
                if (l && valid.indexOf(l) === -1) valid.push(l)
            })

            return valid
                
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
        
    } catch (error) {
        throw error
    }
}

const input_schema = z.object({
    input: z.array(z.string())
})
export async function POST(req: NextRequest) {
    try {
        const {input} = input_schema.parse(await req.json())
        const results = await verify_input(input, false)
        return NextResponse.json(results, {status: 200})
    } catch (error) {
        console.log("error", error)
        return NextResponse.json(error, {status: 400})
    }
}