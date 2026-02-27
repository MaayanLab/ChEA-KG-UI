import TermAndGeneSearch from '@/components/TermAndGeneSearch'
import DistilleryLanding from '@/components/Distillery'
import SanitizedHTML from '@/components/SanitizedHTML'
import Markdown from '@/components/MarkdownComponent'
import DistilleryUseCase from '@/components/Distillery/DistilleryUseCase'
// import Enrichment from '@/components/Enrichment'
import Chea3Enrichment from '@/components/Chea3Enrichment'
import Download from '@/components/Download'
import DownloadFiles from '@/components/DownloadFiles'
import APIDoc from '@/components/APIDoc'
import SimpleTermAndGeneSearch from '@/components/SimpleTermAndGeneSearch'
import Credits from '@/components/Credits'
import Tutorial from '@/components/Tutorial.mdx'
import { Suspense } from 'react'
import EnrichmentUseCase from '@/components/EnrichmentUseCase'
import CancerUseCase from '@/components/CancerUseCase'
import UseCaseLib from '@/components/UseCaseLib'
import MOAUseCase from '@/components/MOAUseCase'
import AgingUseCase from '@/components/AgingUseCase'

export const AsyncComponent = async ({component, searchParams, props, endpoint,}: 
	{component: string, endpoint: string, searchParams: {[key:string]: any}, 
	props: {[key:string]: any}}) => {
	if (component === "KnowledgeGraph") return await TermAndGeneSearch({props, searchParams})
	else if (component === "SimpleKnowledgeGraph") return await SimpleTermAndGeneSearch({props, searchParams})
	else if (component === "DistilleryLanding") return await DistilleryLanding({...props})
	else if (component === "SanitizedHTML") return await SanitizedHTML({...props})
	else if (component === "Markdown") return await Markdown({...props})
	else if (component === "DistilleryUseCase") return await DistilleryUseCase({searchParams, ...props})
	// else if (component === "Enrichment") return await Enrichment({endpoint, searchParams, ...props})
	else if (component === "EnrichmentUseCase") return await EnrichmentUseCase({endpoint, searchParams, ...props})
	else if (component === "CancerUseCase") return await CancerUseCase({endpoint, searchParams, ...props})
	else if (component === "Chea3Enrichment") return await Chea3Enrichment({endpoint, searchParams, ...props})
	else if (component === "Download") return await Download({...props})
	else if (component === "APIDoc") return await APIDoc({...props})
	else if (component === "Tutorial") return <Tutorial/>
	else if (component === "DownloadFiles") return await DownloadFiles({...props})
	else if (component === "Credits") return await Credits()
	else if (component == 'UseCaseLib') return await UseCaseLib({...props})
	else if (component == "MOAUseCase") return await MOAUseCase({endpoint, searchParams, ...props})
	else if (component == 'AgingUseCase') return await AgingUseCase({endpoint, searchParams, ...props})
	else return null
}

// export const Component = (props: {component: string, endpoint: string, searchParams: {[key:string]: any}, props: {[key:string]: any}}) => {
// 	return <Suspense>
// 		<AsyncComponent {...props}/>
// 	</Suspense>
// }