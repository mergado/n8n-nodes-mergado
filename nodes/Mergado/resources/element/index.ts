import type { INodeProperties } from 'n8n-workflow';
import { projectSelectors } from '../../shared/descriptions';

const showOnlyForElements = {
	resource: ['element'],
};

export const elementDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForElements,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get the element tree of a project',
				description:
					'Get many elements and attributes of a project as a tree. Use their paths in MQL queries and rules.',
				routing: {
					request: {
						method: 'GET',
						url: '=/projects/{{$parameter.projectId}}/elements/',
					},
				},
			},
		],
		default: 'getAll',
	},
	...projectSelectors(showOnlyForElements),
];
