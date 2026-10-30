import type { IExecuteSingleFunctions, INodeExecutionData } from 'n8n-workflow';

/**
 * The project's `url` is its input feed. Mergado doesn't return the output feed URL;
 * it is composed from the project's `slug`, the same way the Mergado MCP server does.
 */
export async function addOutputFeedUrl(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	return items.map((item) => {
		const slug = item.json.slug;
		if (typeof slug !== 'string' || !slug) return item;
		return {
			...item,
			json: { ...item.json, output_feed_url: `https://feeds.mergado.com/${slug}.xml` },
		};
	});
}
