import type {
	IDataObject,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IPollFunctions,
} from 'n8n-workflow';

export const MERGADO_API_URL = 'https://api.mergado.com';

/**
 * Without this header the API answers as it did on 2020-09-07. The node is built
 * against the API documentation of this date.
 */
export const MERGADO_API_VERSION = '2026-10-30';

export async function mergadoApiRequest(
	this:
		| IHookFunctions
		| IExecuteFunctions
		| IExecuteSingleFunctions
		| ILoadOptionsFunctions
		| IPollFunctions,
	method: IHttpRequestMethods,
	resource: string,
	qs: IDataObject = {},
	body: IDataObject | undefined = undefined,
) {
	const options: IHttpRequestOptions = {
		method,
		qs,
		body,
		url: `${MERGADO_API_URL}${resource}`,
		headers: { 'use-mergado-api-version': MERGADO_API_VERSION },
		json: true,
	};

	return this.helpers.httpRequestWithAuthentication.call(this, 'mergadoOAuth2Api', options);
}

/** Mergado lists e-shops per user, so the ID of the signed-in user comes first. */
export async function getCurrentUserId(
	this: IExecuteSingleFunctions | ILoadOptionsFunctions,
): Promise<string> {
	const me = (await mergadoApiRequest.call(this, 'GET', '/me/')) as { id: string };
	return me.id;
}
