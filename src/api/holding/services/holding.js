'use strict';

/**
 * holding service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::holding.holding');
