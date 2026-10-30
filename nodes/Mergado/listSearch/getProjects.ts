import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { mergadoApiRequest } from '../shared/transport';

type Project = { id: string; name: string; output_format: string };

type ProjectListResponse = { data: Project[]; total_results: number };

const PAGE_SIZE = 100;

export async function getProjects(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const shopId = this.getCurrentNodeParameter('shopId', { extractValue: true }) as string;
	if (!shopId) return { results: [] };

	const offset = paginationToken ? +paginationToken : 0;
	const response = (await mergadoApiRequest.call(this, 'GET', `/shops/${shopId}/projects/`, {
		limit: PAGE_SIZE,
		offset,
		fields: 'id,name,output_format',
	})) as ProjectListResponse;

	const search = filter?.toLowerCase();
	const results = response.data
		.filter((project) => !search || project.name.toLowerCase().includes(search))
		.map((project) => ({
			name: `${project.name} (${project.output_format})`,
			value: project.id,
		}));

	const nextOffset = offset + PAGE_SIZE;
	return {
		results,
		paginationToken: nextOffset < response.total_results ? nextOffset.toString() : undefined,
	};
}
