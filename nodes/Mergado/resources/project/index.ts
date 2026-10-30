import type { INodeProperties } from 'n8n-workflow';
import {
	dataRootProperty,
	getManyProperties,
	projectSelectors,
	shopSelect,
} from '../../shared/descriptions';
import { addOutputFeedUrl } from '../../shared/utils';

const showOnlyForProjects = {
	resource: ['project'],
};

export const projectDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForProjects,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a project',
				description: 'Get a project, including the URL of its output feed (output_feed_url)',
				routing: {
					request: {
						method: 'GET',
						url: '=/projects/{{$parameter.projectId}}/',
					},
					output: {
						postReceive: [addOutputFeedUrl],
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many projects',
				description: 'Get the projects of a shop, including the URLs of their output feeds',
				routing: {
					request: {
						method: 'GET',
						url: '=/shops/{{$parameter.shopId}}/projects/',
					},
					output: {
						postReceive: [...dataRootProperty.output.postReceive, addOutputFeedUrl],
					},
				},
			},
		],
		default: 'get',
	},
	{
		...shopSelect,
		displayOptions: { show: { ...showOnlyForProjects, operation: ['getAll'] } },
	},
	...projectSelectors({ ...showOnlyForProjects, operation: ['get'] }),
	...getManyProperties({ ...showOnlyForProjects, operation: ['getAll'] }),
];
