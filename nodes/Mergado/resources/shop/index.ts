import type { IExecuteSingleFunctions, IHttpRequestOptions, INodeProperties } from 'n8n-workflow';
import { dataRootProperty, getManyProperties } from '../../shared/descriptions';
import { getCurrentUserId } from '../../shared/transport';

const showOnlyForShops = {
	resource: ['shop'],
};

async function setUserShopsUrl(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const userId = await getCurrentUserId.call(this);
	requestOptions.url = `/users/${userId}/shops/`;
	return requestOptions;
}

export const shopDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForShops,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many shops',
				description: 'Get the shops (e-shops) you have access to',
				routing: {
					request: {
						method: 'GET',
						// Replaced by setUserShopsUrl with the ID of the signed-in user.
						url: '/users/{userId}/shops/',
					},
					send: {
						preSend: [setUserShopsUrl],
					},
					...dataRootProperty,
				},
			},
		],
		default: 'getAll',
	},
	...getManyProperties({ ...showOnlyForShops, operation: ['getAll'] }),
];
