import type { INodeProperties } from 'n8n-workflow';

const showOnlyForUsers = {
	resource: ['user'],
};

export const userDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForUsers,
		},
		options: [
			{
				name: 'Get Current',
				value: 'getCurrent',
				action: 'Get the current user',
				description: 'Get the Mergado user the credential belongs to',
				routing: {
					request: {
						method: 'GET',
						url: '/me/',
					},
				},
			},
		],
		default: 'getCurrent',
	},
];
