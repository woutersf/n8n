import {
	ICredentialType,
	IDisplayOptions,
	NodePropertyTypes,
} from 'n8n-workflow';

export class Drupal implements ICredentialType {
	name = 'drupal';
	displayName = 'Drupal';
	documentationUrl = 'drupal';
	properties = [
		{
			displayName: 'Hostname',
			name: 'hostname',
			type: 'string' as NodePropertyTypes,
			default: '',
			placeholder: 'localhost',
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number' as NodePropertyTypes,
			default: 80,
		},
		{
			displayName: 'User',
			name: 'username',
			type: 'string' as NodePropertyTypes,
			default: '',
			placeholder: 'guest',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string' as NodePropertyTypes,
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'guest',
		},
		{
			displayName: 'SSL',
			name: 'ssl',
			type: 'boolean' as NodePropertyTypes,
			default: false,
		},
		{
			displayName: 'Passwordless',
			name: 'passwordless',
			type: 'boolean' as NodePropertyTypes,
			displayOptions: {
				show: {
					ssl: [
						true,
					],
				},
			},
			default: true,
			description: 'Passwordless connection with certificates (SASL mechanism EXTERNAL)',
		},
		{
			displayName: 'CA Certificates',
			name: 'ca',
			type: 'string' as NodePropertyTypes,
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					ssl: [
						true,
					],
				},
			},
			default: '',
			description: 'SSL CA Certificates to use.',
		},
		{
			displayName: 'Client Certificate',
			name: 'cert',
			type: 'string' as NodePropertyTypes,
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					ssl: [
						true,
					],
					passwordless: [
						true,
					],
				},
			} as IDisplayOptions,
			default: '',
			description: 'SSL Client Certificate to use.',
		},
		{
			displayName: 'Client Key',
			name: 'key',
			type: 'string' as NodePropertyTypes,
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					ssl: [
						true,
					],
					passwordless: [
						true,
					],
				},
			},
			default: '',
			description: 'SSL Client Key to use.',
		},
		{
			displayName: 'Passphrase',
			name: 'passphrase',
			type: 'string' as NodePropertyTypes,
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					ssl: [
						true,
					],
					passwordless: [
						true,
					],
				},
			},
			default: '',
			description: 'SSL passphrase to use.',
		},
	];
}
