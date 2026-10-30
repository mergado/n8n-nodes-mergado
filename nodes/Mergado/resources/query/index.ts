import type { INodeProperties } from 'n8n-workflow';
import { dataRootProperty, getManyProperties, projectSelectors } from '../../shared/descriptions';

const showOnlyForQueries = {
	resource: ['query'],
};

const showOnlyForQueryCreate = {
	...showOnlyForQueries,
	operation: ['create'],
};

export const queryDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForQueries,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a query',
				description: 'Create a saved query (product selection) in a project',
				routing: {
					request: {
						method: 'POST',
						url: '=/projects/{{$parameter.projectId}}/queries/',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many queries',
				description: 'Get the saved queries (product selections) of a project',
				routing: {
					request: {
						method: 'GET',
						url: '=/projects/{{$parameter.projectId}}/queries/',
					},
					...dataRootProperty,
				},
			},
		],
		default: 'getAll',
	},
	...projectSelectors(showOnlyForQueries),
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForQueryCreate },
		default: '',
		placeholder: 'e.g. Cheap products',
		description: 'Name of the query shown in Mergado',
		routing: {
			send: {
				type: 'body',
				property: 'name',
			},
		},
	},
	{
		displayName: 'MQL Query',
		name: 'query',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForQueryCreate },
		default: '',
		placeholder: 'e.g. PRICE_VAT < 100',
		description: 'Condition in Mergado Query Language. Element names are case-sensitive.',
		routing: {
			send: {
				type: 'body',
				property: 'query',
			},
		},
	},
	...getManyProperties({ ...showOnlyForQueries, operation: ['getAll'] }),
];
