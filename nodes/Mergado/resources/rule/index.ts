import type { INodeProperties } from 'n8n-workflow';
import {
	dataRootProperty,
	getManyProperties,
	projectSelectors,
	ruleSelect,
} from '../../shared/descriptions';

const showOnlyForRules = {
	resource: ['rule'],
};

const showOnlyForSingleRule = {
	...showOnlyForRules,
	operation: ['get', 'pause', 'resume'],
};

export const ruleDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForRules,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a rule',
				description: 'Get a rule with its settings',
				routing: {
					request: {
						method: 'GET',
						url: '=/rules/{{$parameter.ruleId}}/',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many rules',
				description: 'Get the rules of a project, ordered by priority',
				routing: {
					request: {
						method: 'GET',
						url: '=/projects/{{$parameter.projectId}}/rules/',
					},
					...dataRootProperty,
				},
			},
			{
				name: 'Pause',
				value: 'pause',
				action: 'Pause a rule',
				description: 'Stop applying a rule to the products. Its settings are kept.',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/rules/{{$parameter.ruleId}}/',
						body: { applies: false },
					},
				},
			},
			{
				name: 'Resume',
				value: 'resume',
				action: 'Resume a rule',
				description: 'Apply a paused rule to the products again',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/rules/{{$parameter.ruleId}}/',
						body: { applies: true },
					},
				},
			},
		],
		default: 'getAll',
	},
	...projectSelectors({ ...showOnlyForRules, operation: ['getAll'] }),
	// Here the project only serves the rule list; a rule ID is enough on its own.
	...projectSelectors(showOnlyForSingleRule).map((property) =>
		property.name === 'projectId'
			? {
					...property,
					required: false,
					description:
						'The project the rule belongs to. Only used to list its rules; not needed when you enter the rule ID.',
				}
			: property,
	),
	{
		...ruleSelect,
		displayOptions: { show: showOnlyForSingleRule },
	},
	...getManyProperties({ ...showOnlyForRules, operation: ['getAll'] }),
];
