import type { INodeProperties } from 'n8n-workflow';
import { dataRootProperty, getManyProperties, projectSelectors } from '../../shared/descriptions';

const showOnlyForProducts = {
	resource: ['product'],
};

const showOnlyForProductSearch = {
	...showOnlyForProducts,
	operation: ['search'],
};

export const productDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForProducts,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a product',
				description: 'Get a product with its input and output values',
				routing: {
					request: {
						method: 'GET',
						url: '=/products/{{$parameter.productId}}/',
					},
				},
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search products',
				description: 'Search the products of a project with an MQL query',
				routing: {
					request: {
						method: 'POST',
						url: '=/projects/{{$parameter.projectId}}/products',
					},
					...dataRootProperty,
				},
			},
		],
		default: 'search',
	},
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		required: true,
		displayOptions: { show: { ...showOnlyForProducts, operation: ['get'] } },
		default: '',
		placeholder: 'e.g. 1234567',
		description: 'The Mergado ID of the product (not the ITEM_ID from the feed)',
	},
	...projectSelectors(showOnlyForProductSearch),
	{
		displayName: 'MQL Query',
		name: 'mql',
		type: 'string',
		displayOptions: { show: showOnlyForProductSearch },
		default: '',
		placeholder: 'e.g. PRICE_VAT < 100',
		description:
			'Condition in Mergado Query Language. It is evaluated on the input values of the products. Element names are case-sensitive. Leave empty to return all products.',
		routing: {
			send: {
				type: 'body',
				property: 'mql',
			},
		},
	},
	...getManyProperties(showOnlyForProductSearch),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: { show: showOnlyForProductSearch },
		default: {},
		options: [
			{
				displayName: 'Visibility',
				name: 'isHidden',
				type: 'options',
				options: [
					{ name: 'Only Hidden', value: 'true' },
					{ name: 'Only Visible', value: 'false' },
				],
				default: 'false',
				description:
					'Return only products hidden from the output feed, or only visible ones. Leave the option out to get both.',
				routing: {
					send: {
						type: 'query',
						property: 'is_hidden',
					},
				},
			},
			{
				displayName: 'Values to Extract',
				name: 'valuesToExtract',
				type: 'string',
				default: '',
				placeholder: 'e.g. ITEM_ID, PRICE_VAT, PARAM | PARAM_NAME',
				description:
					'Comma-separated element paths or variable names. The response then contains only these values in "extracted_values" instead of all product data.',
				routing: {
					send: {
						type: 'query',
						property: 'values_to_extract',
						value:
							'={{ JSON.stringify($value.split(",").map(path => path.trim()).filter(path => path)) }}',
					},
				},
			},
		],
	},
];
