import {
	parse as urlParse,
} from 'url';

import {
	IHookFunctions,
	IWebhookFunctions,
} from 'n8n-core';

import {
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData, NodeOperationError,
} from 'n8n-workflow';

import {
	drupalApiRequest,
} from './GenericFunctions';

export class DrupalTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Drupal Trigger',
		name: 'drupalTrigger',
		icon: 'file:drupal.png',
		group: ['trigger'],
		version: 1,
		description: 'Handle Drupal events via webhooks',
		defaults: {
			name: 'Drupal Trigger',
			color: '#006caa',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'drupal',
				required: true,
				displayOptions: {
					show: {
						authentication: [
							'credentials',
						],
					},
				},
			},
			// {
			// 	name: 'mauticOAuth2Api',
			// 	required: true,
			// 	displayOptions: {
			// 		show: {
			// 			authentication: [
			// 				'oAuth2',
			// 			],
			// 		},
			// 	},
			// },
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Credentials',
						value: 'credentials',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'credentials',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				typeOptions: {
					loadOptionsMethod: 'getEvents',
				},
				default: [],
			},
			{
				displayName: 'Events Order',
				name: 'eventsOrder',
				type: 'options',
				default: 'ASC',
				options: [
					{
						name: 'ASC',
						value: 'ASC',
					},
					{
						name: 'DESC',
						value: 'DESC',
					},
				],
				description: 'Order direction for queued events in one webhook. Can be “DESC” or “ASC”',
			},
		],
	};
	methods = {
		loadOptions: {
			// Get all the events to display them to user so that he can
			// select them easily
			async getEvents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const credentials = this.getCredentials('drupal');
				if (credentials === undefined) {
					throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
				}
				const { triggers } = await drupalApiRequest.call(this, (credentials.hostname as string), 'GET', '/hooks/triggers');
				for (const [key, value] of Object.entries(triggers)) {
					const eventId = key;
					const eventName = (value as IDataObject).label as string;
					const eventDecription = (value as IDataObject).description as string;
					returnData.push({
						name: eventName,
						value: eventId,
						description: eventDecription,
					});
				}
				return returnData;
			},
		},
	};
	// @ts-ignore
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const credentials = this.getCredentials('drupal');
				if (credentials === undefined) {
					throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
				}
				const webhookData = this.getWorkflowStaticData('node');
				if (webhookData.webhookId === undefined) {
					return false;
				}
				const endpoint = `/hooks/${webhookData.webhookId}`;
				try {
					await drupalApiRequest.call(this, (credentials.hostname as string), 'GET', endpoint, {});
				} catch (error) {
					return false;
				}
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const webhookData = this.getWorkflowStaticData('node');
				const events = this.getNodeParameter('events', 0) as string[];
				const eventsOrder = this.getNodeParameter('eventsOrder', 0) as string;
				const credentials = this.getCredentials('drupal');
				if (credentials === undefined) {
					throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
				}
				const urlParts = urlParse(webhookUrl);
				const body: IDataObject = {
					name: `n8n-webhook:${urlParts.path}`,
					description: 'n8n webhook',
					webhookUrl,
					triggers: events,
					eventsOrderbyDir: eventsOrder,
					isPublished: true,
				};
				const { hook } = await drupalApiRequest.call(this, (credentials.hostname as string), 'POST', '/hooks/new', body);
				webhookData.webhookId = hook.id;
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const credentials = this.getCredentials('drupal');
				if (credentials === undefined) {
					throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
				}
				const webhookData = this.getWorkflowStaticData('node');
				try {
					await drupalApiRequest.call(this, (credentials.hostname as string),'DELETE', `/hooks/${webhookData.webhookId}/delete`);
				} catch (error) {
					return false;
				}
				delete webhookData.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		return {
			workflowData: [
				this.helpers.returnJsonArray(req.body),
			],
		};
	}
}
