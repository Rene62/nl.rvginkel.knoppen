'use strict';

module.exports = {

    /**
     * Alle Homey Logic Ja/Nee-variabelen ophalen.
     */
    async getBooleanVariables({ homey }) {



        const variables =
            await homey.app.homeyApi.logic.getVariables();


        const booleanVariables =
            Object.values(variables)
                .filter(variable =>
                    variable.type === 'boolean'
                )
                .map(variable => ({
                    id: variable.id,
                    name: variable.name
                }))
                .sort((a, b) =>
                    a.name.localeCompare(
                        b.name,
                        'nl',
                        { sensitivity: 'base' }
                    )
                );


        return booleanVariables;
    },

    /**
     * Alle knoppen ophalen.
     */
    async getButtons({ homey }) {

        const buttons =
            homey.app.buttonStore.getAll();

        return buttons.toJSON();
    },


    /**
     * Nieuwe knop aanmaken.
     */
    async createButton({ homey, body }) {

        const button =
            homey.app.buttonStore.create({
                type: body?.type || 'action',
                text: body?.text || homey.__('settings.new_button_default'),
                width: body?.width || 'small',
                actionValue: body?.actionValue || '',
                variableId: body?.variableId || null,
                variableName: body?.variableName || null
            });

        return button.toJSON();
    },


    /**
     * Bestaande knop wijzigen.
     */
    async updateButton({ homey, body }) {

        if (!body?.id) {
            throw new Error(homey.__('errors.no_button_id'));
        }

        const button =
            homey.app.buttonStore.update(
                body.id,
                {
                    type: body.type,
                    text: body.text,
                    width: body.width,
                    actionValue: body.actionValue,
                    variableId: body.variableId,
                    variableName: body.variableName
                }
            );

        return button.toJSON();
    },


    /**
     * Knop verwijderen.
     */
    async removeButton({ homey, query }) {


        if (!query?.id) {
            throw new Error(homey.__('errors.no_button_id'));
        }

        const removed =
            homey.app.buttonStore.remove(query.id);

        if (!removed) {
            throw new Error(
                homey.__('errors.button_id_not_found', { id: query.id })
            );
        }

        return {
            success: true
        };
    },

};