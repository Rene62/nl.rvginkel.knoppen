'use strict';

const Homey = require('homey');
const { HomeyAPI } = require('homey-api');
const ButtonStore = require('./widgets/buttons/button-store');

class KnoppenApp extends Homey.App {

    async onInit() {

        this.log('Knoppen app gestart');

        // Centrale opslag voor alle knoppen
        this.buttonStore =
            new ButtonStore(this.homey);

        const buttons =
            this.buttonStore.getAll();



        // Toegang tot Homey's Web API

        this.homeyApi =
            await HomeyAPI.createAppAPI({
                homey: this.homey,
            });



        await this.homeyApi.logic.connect();

        this.homeyApi.logic.on(
            'variable.update',
            variable => {

                const buttons =
                    this.buttonStore
                        .getAll()
                        .getAll();


                const isUsedByBooleanButton =
                    buttons.some(button =>
                        button.type === 'boolean' &&
                        button.variableId === variable.id
                    );

                if (!isUsedByBooleanButton) {
                    return;
                }

                this.homey.api.realtime(
                    'booleanVariableChanged',
                    {
                        variableId: variable.id,
                        value: variable.value
                    }
                );
            }
        );




        // actiekaart lichtloop

        this.startButtonLightloopAction =
            this.homey.flow.getActionCard(
                'start_button_lightloop'
            );

        this.startButtonLightloopAction
            .getArgument('button')
            .registerAutocompleteListener(
                async query => {

                    const buttons =
                        this.buttonStore
                            .getAll()
                            .getAll();

                    return buttons
                        .filter(button =>
                            button.type === 'action'
                        )
                        .filter(button =>
                            button.text
                                .toLowerCase()
                                .includes(
                                    query.toLowerCase()
                                )
                        )
                        .map(button => ({
                            id: button.id,
                            name:
                                this.homey.__('autocomplete.button_name', { number: button.number, text: button.text })
                        }));
                }
            );

        this.startButtonLightloopAction
            .registerRunListener(
                async args => {

                    const button =
                        this.buttonStore
                            .getAll()
                            .getById(
                                args.button.id
                            );

                    if (!button) {
                        throw new Error(
                            this.homey.__('errors.button_not_found')
                        );
                    }

                    if (button.enabled === false) {
                        return true;
                    }

                    await this.homey.api.realtime(
                        'buttonLightloop',
                        {
                            buttonId: button.id,
                            duration: args.duration,
                            color: args.color
                        }
                    );

                    return true;
                }
            );


        // actiekaart permanente kleur

        this.setButtonPermanentColorAction =
            this.homey.flow.getActionCard(
                'set_button_permanent_color'
            );

        this.setButtonPermanentColorAction
            .getArgument('button')
            .registerAutocompleteListener(
                async query => {

                    const buttons =
                        this.buttonStore
                            .getAll()
                            .getAll();

                    return buttons
                        .filter(button =>
                            button.type === 'action'
                        )
                        .filter(button =>
                            button.text
                                .toLowerCase()
                                .includes(
                                    query.toLowerCase()
                                )
                        )
                        .map(button => ({
                            id: button.id,
                            name:
                                this.homey.__(
                                    'autocomplete.button_name',
                                    {
                                        number: button.number,
                                        text: button.text
                                    }
                                )
                        }));
                }
            );

        this.setButtonPermanentColorAction
            .registerRunListener(
                async args => {

                    const enabled =
                        args.enabled === 'true';

                    const button =
                        this.buttonStore.setPermanentColor(
                            args.button.id,
                            enabled,
                            args.color
                        );

                    await this.homey.api.realtime(
                        'buttonPermanentColorChanged',
                        {
                            buttonId: button.id,
                            enabled:
                                button.permanentColorEnabled,
                            color:
                                button.permanentColor
                        }
                    );

                    return true;
                }
            );



        // Flow-trigger: Actieknop
        this.actionButtonTrigger =
            this.homey.flow.getTriggerCard(
                'action_button-pressed'
            );

        this.actionButtonTrigger
            .registerArgumentAutocompleteListener(
                'button',
                async (query, args) => {

                    const buttons =
                        this.buttonStore
                            .getAll()
                            .getAll();

                    return buttons
                        .filter(button =>
                            button.type === 'action'
                        )
                        .filter(button => {

                            const name =
                                this.homey.__('autocomplete.button_name', { number: button.number, text: button.text });

                            return name
                                .toLowerCase()
                                .includes(
                                    query.toLowerCase()
                                );
                        })
                        .map(button => ({
                            id: button.id,
                            name:
                                this.homey.__('autocomplete.button_name', { number: button.number, text: button.text })
                        }));
                }
            );


        this.actionButtonTrigger.registerRunListener(
            async (args, state) => {

                return (
                    args.button?.id ===
                    state.buttonId
                );
            }
        );





        // flow trigger button en/disabled

        this.setButtonEnabledAction =
            this.homey.flow.getActionCard(
                'set_button_enabled'
            );

        this.setButtonEnabledAction
            .getArgument('button')
            .registerAutocompleteListener(
                async query => {

                    const buttons =
                        this.buttonStore
                            .getAll()
                            .getAll();

                    return buttons
                        .filter(button =>
                            button.text
                                .toLowerCase()
                                .includes(
                                    query.toLowerCase()
                                )
                        )
                        .map(button => ({
                            id: button.id,
                            name:
                                this.homey.__('autocomplete.button_name', { number: button.number, text: button.text })
                        }));
                }
            );

        this.setButtonEnabledAction
            .registerRunListener(
                async args => {

                    const enabled =
                        args.enabled === 'true';

                    const button =
                        this.buttonStore.setEnabled(
                            args.button.id,
                            enabled
                        );

                    await this.homey.api.realtime(
                        'buttonEnabledChanged',
                        {
                            buttonId: button.id,
                            enabled: button.enabled
                        }
                    );



                    return true;
                }
            );


        this.booleanButtonTrigger =
            this.homey.flow.getTriggerCard(
                'boolean_button_pressed'
            );

        this.booleanButtonTrigger
            .registerArgumentAutocompleteListener(
                'button',
                async (query, args) => {

                    const buttons =
                        this.buttonStore
                            .getAll()
                            .getAll();

                    return buttons
                        .filter(button =>
                            button.type === 'boolean'
                        )
                        .filter(button => {

                            const name =
                                this.homey.__('autocomplete.button_name', { number: button.number, text: button.text });

                            return name
                                .toLowerCase()
                                .includes(
                                    query.toLowerCase()
                                );
                        })
                        .map(button => ({
                            id: button.id,
                            name:
                                this.homey.__('autocomplete.button_name', { number: button.number, text: button.text })
                        }));
                }
            );
        this.booleanButtonTrigger.registerRunListener(
            async (args, state) => {

                return (
                    args.button?.id ===
                    state.buttonId
                );
            }
        );


        // Widget-instellingen: knoppen per positie
        const buttonsWidget =
            this.homey.dashboards.getWidget(
                'buttons'
            );

        const registerButtonAutocomplete =
            settingId => {

                buttonsWidget.registerSettingAutocompleteListener(
                    settingId,
                    async (query, settings) => {

                        const buttons =
                            this.buttonStore
                                .getAll()
                                .getAll();

                        const currentButtonId =
                            settings[settingId]?.id;

                        const currentButtonExists =
                            !currentButtonId ||
                            buttons.some(
                                button =>
                                    button.id === currentButtonId
                            );

                        const emptyOptionName =
                            currentButtonExists
                                ? this.homey.__('autocomplete.empty')
                                : this.homey.__('autocomplete.empty_deleted');

                        const selectedButtonIds = [];

                        for (let i = 1; i <= 12; i++) {

                            const buttonId =
                                settings[`button${i}`]?.id;

                            if (
                                buttonId &&
                                buttonId !== currentButtonId
                            ) {
                                selectedButtonIds.push(
                                    buttonId
                                );
                            }
                        }

                        const results =
                            buttons
                                .filter(button =>
                                    !selectedButtonIds.includes(
                                        button.id
                                    )
                                )
                                .filter(button => {

                                    const name =
                                        this.homey.__('autocomplete.button_name', { number: button.number, text: button.text });

                                    return name
                                        .toLowerCase()
                                        .includes(
                                            query.toLowerCase()
                                        );
                                })
                                .map(button => ({
                                    id: button.id,
                                    name:
                                        this.homey.__('autocomplete.button_name', { number: button.number, text: button.text })
                                }));

                        if (
                            emptyOptionName
                                .toLowerCase()
                                .includes(query.toLowerCase())
                        ) {
                            results.unshift({
                                id: null,
                                name: emptyOptionName
                            });
                        }

                        return results;
                    }
                );
            };

        for (let i = 1; i <= 12; i++) {
            registerButtonAutocomplete(
                `button${i}`
            );
        }


    }
    async triggerActionButton(buttonId) {

        const button =
            this.buttonStore.getById(buttonId);

        if (!button) {
            throw new Error(
                this.homey.__('errors.button_id_not_found', { id: buttonId })
            );
        }

        if (button.type !== 'action') {
            throw new Error(
                this.homey.__('errors.not_action_button', { name: button.text })
            );
        }

        await this.actionButtonTrigger.trigger(
            {
                actionValue: button.actionValue
            },
            {
                buttonId: button.id
            }
        );
    }

    async triggerBooleanButton(buttonId) {

        const button =
            this.buttonStore.getById(buttonId);

        if (!button) {
            throw new Error(
                this.homey.__('errors.button_id_not_found', { id: buttonId })
            );
        }

        if (button.type !== 'boolean') {
            throw new Error(
                this.homey.__('errors.not_boolean_button', { name: button.text })
            );
        }

        if (!button.variableId) {
            throw new Error(
                this.homey.__('errors.no_boolean_variable', { name: button.text })
            );
        }

        const variables =
            await this.homeyApi.logic.getVariables();

        const variable =
            variables[button.variableId];

        if (!variable) {
            throw new Error(
                this.homey.__('errors.boolean_variable_not_found', { name: button.text })
            );
        }

        if (variable.type !== 'boolean') {
            throw new Error(
                this.homey.__('errors.variable_not_boolean', { name: button.text })
            );
        }



        const buttonValue =
            !variable.value;



        await this.booleanButtonTrigger.trigger(
            {
                buttonValue: buttonValue
            },
            {
                buttonId: button.id
            }
        );



    }

}

module.exports = KnoppenApp;