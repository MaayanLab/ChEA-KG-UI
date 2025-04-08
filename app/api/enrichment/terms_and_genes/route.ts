
import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server' 
import { z } from 'zod'
import { verify_input } from "./helper"
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