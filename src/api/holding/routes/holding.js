'use strict';

/**
 * holding router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::holding.holding');
