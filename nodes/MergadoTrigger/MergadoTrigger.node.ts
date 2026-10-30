import {
	NodeConnectionTypes,
	type IDataObject,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type IPollFunctions,
} from 'n8n-workflow';
import { getProjects } from '../Mergado/listSearch/getProjects';
import { getShops } from '../Mergado/listSearch/getShops';
import { projectSelect, shopSelect } from '../Mergado/shared/descriptions';
import { mergadoApiRequest } from '../Mergado/shared/transport';

type LogListResponse = { data: IDataObject[] };

/** Each event watches one kind of project log for finished entries in given states. */
const EVENTS: Record<string, { log: string; statuses: string[] }> = {
	exportFinished: { log: 'exportlogs', statuses: ['success', 'warning'] },
	importFailed: { log: 'importlogs', statuses: ['failure'] },
};

export class MergadoTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mergado Trigger',
		name: 'mergadoTrigger',
		icon: { light: 'file:../Mergado/mergado.svg', dark: 'file:../Mergado/mergado.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when a Mergado project exports its feed or fails an import',
		defaults: {
			name: 'Mergado Trigger',
		},
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'mergadoOAuth2Api', required: true }],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Feed Exported',
						value: 'exportFinished',
						description: 'The project finished generating its output feed',
					},
					{
						name: 'Import Failed',
						value: 'importFailed',
						description: 'Importing the input feed of the project failed',
					},
				],
				default: 'exportFinished',
			},
			{
				...shopSelect,
				description:
					'The shop the project belongs to. Only used to list its projects; not needed when you enter the project ID.',
				required: false,
			},
			projectSelect,
		],
	};

	methods = {
		listSearch: {
			getShops,
			getProjects,
		},
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const event = this.getNodeParameter('event') as string;
		const projectId = this.getNodeParameter('projectId', '', { extractValue: true }) as string;
		const { log, statuses } = EVENTS[event];

		// The last seen `finished_at` comes from Mergado itself, so the clocks of
		// n8n and Mergado never have to agree.
		const staticData = this.getWorkflowStaticData('node');
		const lastFinishedAt = staticData.lastFinishedAt as string | undefined;
		const isManual = this.getMode() === 'manual';
		const isFirstRun = !isManual && staticData.initialized !== true;

		const filter: IDataObject[] = [{ field: 'status', op: 'in', value: statuses }];
		if (!isManual && !isFirstRun && lastFinishedAt) {
			filter.push({ field: 'finished_at', op: '>', value: lastFinishedAt });
		}

		const response = (await mergadoApiRequest.call(this, 'GET', `/projects/${projectId}/${log}/`, {
			filter: JSON.stringify(filter),
			order_by: '-finished_at',
			limit: isManual || isFirstRun ? 1 : 100,
		})) as LogListResponse;

		const logs = response.data;
		if (isManual) {
			return logs.length ? [this.helpers.returnJsonArray(logs)] : null;
		}

		if (logs.length) staticData.lastFinishedAt = logs[0].finished_at;
		// The first run only remembers the newest log, so old logs don't fire the workflow.
		if (isFirstRun) {
			staticData.initialized = true;
			return null;
		}
		if (!logs.length) return null;

		return [this.helpers.returnJsonArray(logs.reverse())];
	}
}
