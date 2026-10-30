import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { getCurrentUserId, mergadoApiRequest } from '../shared/transport';

type Shop = { id: string; name: string };

type ShopListResponse = { data: Shop[]; total_results: number };

const PAGE_SIZE = 100;

export async function getShops(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const offset = paginationToken ? +paginationToken : 0;
	const userId = await getCurrentUserId.call(this);
	const response = (await mergadoApiRequest.call(this, 'GET', `/users/${userId}/shops/`, {
		limit: PAGE_SIZE,
		offset,
		fields: 'id,name',
	})) as ShopListResponse;

	const search = filter?.toLowerCase();
	const results = response.data
		.filter((shop) => !search || shop.name.toLowerCase().includes(search))
		.map((shop) => ({
			name: shop.name,
			value: shop.id,
		}));

	const nextOffset = offset + PAGE_SIZE;
	return {
		results,
		paginationToken: nextOffset < response.total_results ? nextOffset.toString() : undefined,
	};
}
