// https://github.com/notum-cz/strapi-plugin-content-versioning#%EF%B8%8F-read-before-installation
module.exports = ({ env }) => ({
	"content-versioning": {
		enabled: false,
	},
	'lookup': {
		enabled: true,
		resolve: './src/plugins/lookup'
	},
	'email': {
		config: {
			//provider: 'sendmail',
			provider: 'nodemailer',
			providerOptions: {
				host: '192.168.64.1',
				port: 25,
				secure: false,
				auth: null
			},
			settings: {
				defaultFrom: 'no-reply@hbz-nrw.de',
			}
		}
	},
});
