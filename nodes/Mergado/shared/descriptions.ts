import type { IDataObject, IDisplayOptions, INodeProperties } from 'n8n-workflow';

const ID_REGEX = '^[0-9A-Za-z]+$';

function idLocator(
	displayName: string,
	name: string,
	searchListMethod: string,
	entity: string,
	example: string,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		modes: [
			{
				displayName: `From List`,
				name: 'list',
				type: 'list',
				placeholder: `Select a ${entity}...`,
				typeOptions: {
					searchListMethod,
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: `e.g. ${example}`,
				validation: [
					{
						type: 'regex',
						properties: {
							regex: ID_REGEX,
							errorMessage: `Not a valid Mergado ${entity} ID`,
						},
					},
				],
			},
		],
	};
}

export const shopSelect = idLocator('Shop', 'shopId', 'getShops', 'shop', '12345');

export const projectSelect = idLocator('Project', 'projectId', 'getProjects', 'project', '67890');

export const ruleSelect = idLocator('Rule', 'ruleId', 'getRules', 'rule', '123456');

/** E-shop and project pickers for operations that work inside a project. */
export function projectSelectors(show: IDisplayOptions['show']): INodeProperties[] {
	return [
		{
			...shopSelect,
			description:
				'The shop the project belongs to. Only used to list its projects; not needed when you enter the project ID.',
			displayOptions: { show },
			required: false,
		},
		{ ...projectSelect, displayOptions: { show } },
	];
}

/**
 * Return All and Limit for Mergado list endpoints. They page with `limit` and
 * `offset` and wrap the items in `data`.
 */
export function getManyProperties(show: IDisplayOptions['show']): INodeProperties[] {
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			displayOptions: { show },
			default: false,
			description: 'Whether to return all results or only up to a given limit',
			routing: {
				send: {
					paginate: '={{ $value }}',
				},
				operations: {
					// The next offset and the end come from the response itself, so a page
					// shorter than requested (a server-side cap) doesn't stop the paging.
					// Lists carry the count in `total_results`, rules in `total`.
					pagination: {
						type: 'generic',
						properties: {
							continue:
								'={{ $response.body.data.length > 0 && $response.body.offset + $response.body.data.length < ($response.body.total_results ?? $response.body.total ?? 0) }}',
							request: {
								// The page request replaces `qs` as a whole, so the expression keeps the
								// operation's own query parameters. It resolves to an object at run time.
								qs: '={{ Object.assign({}, $request.qs, { limit: 100, offset: $response.body ? $response.body.offset + $response.body.data.length : 0 }) }}' as unknown as IDataObject,
							},
						},
					},
				},
			},
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: { show: { ...show, returnAll: [false] } },
			typeOptions: {
				minValue: 1,
			},
			default: 50,
			routing: {
				send: {
					type: 'query',
					property: 'limit',
				},
				output: {
					maxResults: '={{$value}}',
				},
			},
			description: 'Max number of results to return',
		},
	];
}

/** Unwraps the `data` array of a Mergado list response into separate items. */
export const dataRootProperty = {
	output: {
		postReceive: [
			{
				type: 'rootProperty' as const,
				properties: { property: 'data' },
			},
		],
	},
};
