import type { ICredentialType, INodeProperties } from 'n8n-workflow';

/**
 * Mergado signs users in through its OAuth 2.1 server (app.mergado.com), the same one
 * the Mergado MCP server uses. The server supports Dynamic Client Registration and
 * public clients with PKCE, so n8n registers its own client for each instance with
 * that instance's redirect URL. No client ID or secret ships with this package.
 */
export class MergadoOAuth2Api implements ICredentialType {
	name = 'mergadoOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'Mergado OAuth2 API';

	icon = {
		light: 'file:../nodes/Mergado/mergado.svg',
		dark: 'file:../nodes/Mergado/mergado.dark.svg',
	} as const;

	documentationUrl = 'https://github.com/mergado/n8n-nodes-mergado?tab=readme-ov-file#credentials';

	httpRequestNode = {
		name: 'Mergado',
		docsUrl: 'https://api-docs.mergado.com/',
		apiBaseUrl: 'https://api.mergado.com/',
	};

	properties: INodeProperties[] = [
		{
			displayName: 'Use Dynamic Client Registration',
			name: 'useDynamicClientRegistration',
			type: 'hidden',
			default: true,
		},
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'hidden',
			default: 'https://app.mergado.com',
		},
	];
}
