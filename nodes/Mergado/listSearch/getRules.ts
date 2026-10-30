import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { mergadoApiRequest } from '../shared/transport';

type Rule = {
	id: string;
	name: string | null;
	type: string;
	element_path: string | null;
	applies: boolean;
	is_pausable: boolean;
};

type RuleListResponse = { data: Rule[] };

export async function getRules(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const projectId = this.getCurrentNodeParameter('projectId', { extractValue: true }) as string;
	if (!projectId) return { results: [] };

	// Pause and Resume only make sense for rules Mergado lets you pause (not the format
	// converter, for example). Get lists every rule.
	const operation = this.getCurrentNodeParameter('operation') as string;
	const onlyPausable = operation === 'pause' || operation === 'resume';

	// Without `limit` the API returns all rules of the project, ordered by priority.
	const response = (await mergadoApiRequest.call(
		this,
		'GET',
		`/projects/${projectId}/rules/`,
	)) as RuleListResponse;

	const search = filter?.toLowerCase();
	const results = response.data
		.filter((rule) => !onlyPausable || rule.is_pausable)
		.map((rule) => {
			const label = rule.name ?? rule.element_path ?? rule.id;
			const state = rule.applies ? 'active' : 'paused';
			return { name: `${label} (${rule.type}, ${state})`, value: rule.id };
		})
		.filter((rule) => !search || rule.name.toLowerCase().includes(search));

	return { results };
}
