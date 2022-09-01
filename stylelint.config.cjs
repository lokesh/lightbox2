'use strict';
/** @type {import('stylelint').Config} */
module.exports = {
	extends: [
		'stylelint-config-standard',
		'stylelint-config-recess-order',
		'stylelint-config-prettier',
	],
	rules: {
		'selector-class-pattern': null,
		'custom-property-pattern':
			/^(?:[a-z][a-z0-9]*)(?:-[a-z0-9]+)*$|^(?:wp|welcome)(?:--?[a-z][a-z0-9]*)+$/,
	},
};
