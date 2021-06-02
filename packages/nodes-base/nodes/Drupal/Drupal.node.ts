import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription, NodeOperationError,
} from 'n8n-workflow';

import {
	drupalApiRequestAllItems,
	drupalApiRequest,
} from './GenericFunctions';

import * as ContentTypeDescription from './ContentTypeDescription';
import * as ContentDescription from './ContentDescription';

export class Drupal implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Drupal',
		name: 'drupal',
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		icon: 'file:drupal.png',
		group: ['input'],
		version: 1,
		description: 'Consume DRUPAL content API',
		defaults: {
			name: 'Drupal',
			color: '#006caa',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'drupal',
				required: true,
			},
		],
		properties: [
			// Resources:
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					ContentTypeDescription.resource,
					ContentDescription.resource,
				],
				default: 'content',
				description: 'The resource to operate on.',
			},

			// Operations:
			...ContentTypeDescription.operations,
			...ContentDescription.operations,

			// Resource specific fields:
			...ContentTypeDescription.fields,
			...ContentDescription.fields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		let responseData;

		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const qs: Record<string, string | number> = {};

		for (let i = 0; i < items.length; i++) {
			if (resource === 'contentType') {
				if (operation === 'get') {

					const credentials = this.getCredentials('drupal');
					if (credentials === undefined) {
						throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
					}

					const id = this.getNodeParameter('contentTypeId', 0) as string;

					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					responseData = await drupalApiRequest.call(this, (credentials.hostname as string), 'GET', `/spaces/${credentials?.spaceId}/content_types/${id}`);

					if (!additionalFields.rawData) {
						responseData = responseData.fields;
					}
				}
			}
			if (resource === 'content') {
				if (operation === 'get') {

					const credentials = this.getCredentials('drupal');
					if (credentials === undefined) {
						throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
					}

					const id = this.getNodeParameter('id', 0) as string;

					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					responseData = await drupalApiRequest.call(this, (credentials.hostname as string), 'GET', `/node/${id}`, {}, qs);

					if (!additionalFields.rawData) {
						responseData = responseData.fields;
					}

				} else if (operation === 'getAll') {
					// const credentials = this.getCredentials('drupal');
					//
					// const returnAll = this.getNodeParameter('returnAll', 0) as boolean;
					//
					// const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
					// const rawData = additionalFields.rawData;
					// additionalFields.rawData = undefined;
					//
					// Object.assign(qs, additionalFields);
					//
					// if (qs.equal) {
					// 	const [atribute, value] = (qs.equal as string).split('=');
					// 	qs[atribute] = value;
					// 	delete qs.equal;
					// }
					//
					// if (qs.notEqual) {
					// 	const [atribute, value] = (qs.notEqual as string).split('=');
					// 	qs[atribute] = value;
					// 	delete qs.notEqual;
					// }
					//
					// if (qs.include) {
					// 	const [atribute, value] = (qs.include as string).split('=');
					// 	qs[atribute] = value;
					// 	delete qs.include;
					// }
					//
					// if (qs.exclude) {
					// 	const [atribute, value] = (qs.exclude as string).split('=');
					// 	qs[atribute] = value;
					// 	delete qs.exclude;
					// }
					//
					// if (returnAll) {
					// 	responseData = await drupalApiRequestAllItems.call(this, 'items', 'GET', `/nodes`, {}, qs);
					//
					// 	if (!rawData) {
					// 		const assets : IDataObject[] = [];
					// 		// tslint:disable-next-line: no-any
					// 		responseData.map((asset : any) => {
					// 			assets.push(asset.fields);
					// 		});
					// 		responseData = assets;
					// 	}
					// } else {
					// 	const limit = this.getNodeParameter('limit', 0) as number;
					// 	qs.limit = limit;
					// 	responseData = await drupalApiRequest.call(this, 'GET', `/spaces/${credentials?.spaceId}/environments/entries`, {}, qs);
					// 	responseData = responseData.items;
					//
					// 	if (!rawData) {
					// 		const assets : IDataObject[] = [];
					// 		// tslint:disable-next-line: no-any
					// 		responseData.map((asset : any) => {
					// 			assets.push(asset.fields);
					// 		});
					// 		responseData = assets;
					// 	}
					// }
				}
			}
			if (Array.isArray(responseData)) {
				returnData.push.apply(returnData, responseData as IDataObject[]);
			} else {
				returnData.push(responseData as IDataObject);
			}
		}
		return [this.helpers.returnJsonArray(returnData)];
	}
}
