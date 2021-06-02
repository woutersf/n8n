import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import {
	OptionsWithUri,
} from 'request';

import {
	IDataObject, NodeApiError, NodeOperationError,
} from 'n8n-workflow';

export async function drupalApiRequest(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions, host: string, method: string, resource: string, body: any = {}, qs: IDataObject = {}, uri?: string, option: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any

	const credentials = this.getCredentials('drupal');
	if (credentials === undefined) {
		throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
	}

	const options: OptionsWithUri = {
		method,
		qs,
		body,
		uri: host,
		json: true,
	};

	qs.access_token = credentials.ContentDeliveryaccessToken as string;

	try {
		return await this.helpers.request!(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}

}

export async function drupalApiRequestAllItems(this: ILoadOptionsFunctions | IExecuteFunctions, propertyName: string, host: string, method: string, resource: string, body: any = {}, query: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any

	const returnData: IDataObject[] = [];

	let responseData;

	query.limit = 100;
	query.skip = 0;

	do {
		responseData = await drupalApiRequest.call(this, host, method, resource, body, query);
		query.skip = (query.skip + 1) * query.limit;
		returnData.push.apply(returnData, responseData[propertyName]);
	} while (
		returnData.length < responseData.total
	);

	return returnData;
}

//
// import {
// 	OptionsWithUri,
// } from 'request';
//
// import {
// 	IExecuteFunctions,
// 	IExecuteSingleFunctions,
// 	IHookFunctions,
// 	ILoadOptionsFunctions,
// } from 'n8n-core';
//
// import {
// 	IDataObject, NodeApiError,
// } from 'n8n-workflow';
//
// interface OMauticErrorResponse {
// 	errors: Array<{
// 		conde: number;
// 		message: string;
// 	}>;
// }
//
// export async function mauticApiRequest(this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions, method: string, endpoint: string, body: any = {}, query?: IDataObject, uri?: string): Promise<any> { // tslint:disable-line:no-any
// 	const authenticationMethod = this.getNodeParameter('authentication', 0, 'credentials') as string;
//
// 	const options: OptionsWithUri = {
// 		headers: {},
// 		method,
// 		qs: query,
// 		uri: uri || `/api${endpoint}`,
// 		body,
// 		json: true,
// 	};
//
// 	try {
//
// 		let returnData;
//
// 		if (authenticationMethod === 'credentials') {
// 			const credentials = this.getCredentials('mauticApi') as IDataObject;
//
// 			const base64Key = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
//
// 			options.headers!.Authorization = `Basic ${base64Key}`;
//
// 			options.uri = `${credentials.url}${options.uri}`;
//
// 			//@ts-ignore
// 			returnData = await this.helpers.request(options);
// 		} else {
// 			const credentials = this.getCredentials('mauticOAuth2Api') as IDataObject;
//
// 			options.uri = `${credentials.url}${options.uri}`;
// 			//@ts-ignore
// 			returnData = await this.helpers.requestOAuth2.call(this, 'mauticOAuth2Api', options, { includeCredentialsOnRefreshOnBody: true });
// 		}
//
// 		if (returnData.errors) {
// 			// They seem to to sometimes return 200 status but still error.
// 			throw new NodeApiError(this.getNode(), returnData);
// 		}
//
// 		return returnData;
// 	} catch (error) {
// 		throw new NodeApiError(this.getNode(), error);
// 	}
// }
//
// /**
//  * Make an API request to paginated mautic endpoint
//  * and return all results
//  */
// export async function mauticApiRequestAllItems(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions, propertyName: string, method: string, endpoint: string, body: any = {}, query: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
//
// 	const returnData: IDataObject[] = [];
//
// 	let responseData;
// 	let data: IDataObject[] = [];
// 	query.limit = 30;
// 	query.start = 0;
//
// 	do {
// 		responseData = await mauticApiRequest.call(this, method, endpoint, body, query);
// 		const values = Object.values(responseData[propertyName]);
// 		for (const value of values) {
// 			data.push(value as IDataObject);
// 		}
// 		returnData.push.apply(returnData, data);
// 		query.start++;
// 		data = [];
// 	} while (
// 		responseData.total !== undefined &&
// 		((query.limit * query.start) - parseInt(responseData.total, 10)) < 0
// 		);
//
// 	return returnData;
// }
//
// export function validateJSON(json: string | undefined): any { // tslint:disable-line:no-any
// 	let result;
// 	try {
// 		result = JSON.parse(json!);
// 	} catch (exception) {
// 		result = undefined;
// 	}
// 	return result;
// }
