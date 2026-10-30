import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { elementDescription } from './resources/element';
import { productDescription } from './resources/product';
import { projectDescription } from './resources/project';
import { queryDescription } from './resources/query';
import { ruleDescription } from './resources/rule';
import { shopDescription } from './resources/shop';
import { userDescription } from './resources/user';
import { getProjects } from './listSearch/getProjects';
import { getRules } from './listSearch/getRules';
import { getShops } from './listSearch/getShops';
import { MERGADO_API_URL, MERGADO_API_VERSION } from './shared/transport';

export class Mergado implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mergado',
		name: 'mergado',
		icon: { light: 'file:mergado.svg', dark: 'file:mergado.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage product feeds in Mergado',
		defaults: {
			name: 'Mergado',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'mergadoOAuth2Api', required: true }],
		requestDefaults: {
			baseURL: MERGADO_API_URL,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'use-mergado-api-version': MERGADO_API_VERSION,
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Element',
						value: 'element',
					},
					{
						name: 'Product',
						value: 'product',
					},
					{
						name: 'Project',
						value: 'project',
					},
					{
						name: 'Query',
						value: 'query',
					},
					{
						name: 'Rule',
						value: 'rule',
					},
					{
						name: 'Shop',
						value: 'shop',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'project',
			},
			...shopDescription,
			...elementDescription,
			...productDescription,
			...projectDescription,
			...queryDescription,
			...ruleDescription,
			...userDescription,
		],
	};

	methods = {
		listSearch: {
			getShops,
			getProjects,
			getRules,
		},
	};
}
