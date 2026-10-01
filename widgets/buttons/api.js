'use strict';

module.exports = {

    // Huidige waarde van een boolean ophalen
    async getBooleanValue({ homey, query }) {

        const variableId = query.variableId;

        if (!variableId) {
            throw new Error(homey.__('errors.no_boolean_variable_specified'));
        }

        const variables =
            await homey.app.homeyApi.logic.getVariables();

        const variable = variables[variableId];

        if (!variable) {
            throw new Error(homey.__('errors.selected_variable_not_found'));
        }

        if (variable.type !== 'boolean') {
            throw new Error(homey.__('errors.selected_variable_not_boolean'));
        }

        return {
            id: variable.id,
            name: variable.name,
            value: variable.value
        };
    },

    async getButtons({ homey }) {

        const buttons =
            homey.app.buttonStore.getAll();

        return buttons.toJSON();
    },
    async triggerActionButton({ homey, body }) {

        const buttonId = body?.buttonId;

        if (!buttonId) {
            throw new Error(
                homey.__('errors.no_button_id')
            );
        }

        await homey.app.triggerActionButton(
            buttonId
        );

        return {
            success: true
        };
    },

    async triggerBooleanButton({ homey, body }) {

        const buttonId = body?.buttonId;

        if (!buttonId) {
            throw new Error(
                homey.__('errors.no_button_id')
            );
        }

        await homey.app.triggerBooleanButton(
            buttonId
        );

        return {
            success: true
        };
    },



};