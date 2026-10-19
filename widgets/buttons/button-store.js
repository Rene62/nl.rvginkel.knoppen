'use strict';

const crypto = require('crypto');

const Button = require('./button');
const Buttons = require('./buttons');

class ButtonStore {

    constructor(homey) {
        this.homey = homey;
        this.nextNumberSettingsKey = 'nextButtonNumber';
        // Eén centrale sleutel voor alle Button-objecten.
        this.settingsKey = 'buttons';
    }


    /**
     * Genereert een unieke, stabiele ID voor een nieuwe knop.
     */
    generateId() {
        return `button_${crypto.randomUUID()}`;
    }

    getNextNumber() {

        let nextNumber =
            this.homey.settings.get(
                this.nextNumberSettingsKey
            );

        if (
            typeof nextNumber !== 'number' ||
            nextNumber < 1
        ) {
            const buttons = this.getAll();

            const highestNumber =
                buttons.getAll().reduce(
                    (highest, button) => {

                        if (
                            typeof button.number === 'number' &&
                            button.number > highest
                        ) {
                            return button.number;
                        }

                        return highest;
                    },
                    0
                );

            nextNumber = highestNumber + 1;
        }

        this.homey.settings.set(
            this.nextNumberSettingsKey,
            nextNumber + 1
        );

        return nextNumber;
    }

    validateType(type) {

        if (!['action', 'boolean'].includes(type)) {
            throw new Error(
                this.homey.__(
                    'errors.invalid_button_type',
                    { type }
                )
            );
        }
    }


    validateWidth(width) {

        if (!['small', 'large'].includes(width)) {
            throw new Error(
                this.homey.__(
                    'errors.invalid_button_width',
                    { width }
                )
            );
        }
    }

    /**
     * Alle opgeslagen knoppen laden.
     *
     * Geeft altijd een Buttons-object terug.
     */
    getAll() {

        const storedButtons =
            this.homey.settings.get(
                this.settingsKey
            ) || [];

        return new Buttons(storedButtons);
    }


    /**
     * Eén knop ophalen op ID.
     */
    getById(id) {

        const buttons = this.getAll();

        return buttons.getById(id);
    }


    /**
     * Nieuwe knop aanmaken en opslaan.
     *
     * enabled wordt hier bewust altijd true.
     * De gebruiker kan dat bij het aanmaken niet bepalen.
     */
    create({
        type = 'action',
        text = 'Nieuwe knop',
        width = 'small',
        textAlign = 'center',
        actionValue = '',
        variableSource = 'homey',
        variableId = null,
        variableName = null
    } = {}) {

        const buttons = this.getAll();

        this.validateType(type);
        this.validateWidth(width);

        const button = new Button({
            id: this.generateId(),
            number: this.getNextNumber(),
            type,
            text,
            width,
            textAlign,

            // Nieuwe knop is altijd actief.
            enabled: true,

            actionValue,

            permanentColorEnabled: false,
            permanentColor: '#00ff66',

            variableSource,
            variableId,
            variableName
        });



        buttons.add(button);

        this.save(buttons);

        return button;
    }


    /**
     * Configuratie van een bestaande knop wijzigen.
     *
     * enabled wordt hier bewust NIET gewijzigd.
     * enabled mag alleen via setEnabled() worden aangepast.
     */
    update(id, {
        type,
        text,
        width,
        textAlign,
        actionValue,
        variableSource,
        variableId,
        variableName
    } = {}) {

        const buttons = this.getAll();

        const button = buttons.getById(id);

        if (!button) {
            throw new Error(
                this.homey.__(
                    'errors.button_id_not_found',
                    { id }
                )
            );
        }

        if (type !== undefined) {
            this.validateType(type);
        }

        if (width !== undefined) {
            this.validateWidth(width);
        }


        // Alleen opgegeven configuratievelden wijzigen

        if (type !== undefined) {
            button.type = type;
        }

        if (text !== undefined) {
            button.text = text;
        }

        if (width !== undefined) {
            button.width = width;
        }

        if (textAlign !== undefined) {
            button.textAlign =
                textAlign === 'left'
                    ? 'left'
                    : 'center';
        }

        if (actionValue !== undefined) {
            button.actionValue = actionValue;
        }

        if (variableSource !== undefined) {
            button.variableSource = variableSource;
        }

        if (variableId !== undefined) {
            button.variableId = variableId;
        }

        if (variableName !== undefined) {
            button.variableName = variableName;
        }


        this.save(buttons);

        return button;
    }


    /**
     * Volledige verzameling opslaan.
     */
    save(buttons) {

        if (!(buttons instanceof Buttons)) {
            throw new Error(
                this.homey.__(
                    'errors.invalid_buttons_object'
                )
            );
        }

        this.homey.settings.set(
            this.settingsKey,
            buttons.toJSON()
        );
    }


    /**
     * Bestaande knop verwijderen.
     */
    remove(id) {

        const buttons = this.getAll();

        const removed = buttons.remove(id);

        if (!removed) {
            return false;
        }

        this.save(buttons);

        return true;
    }


    /**
     * enabled wijzigen.
     *
     * Dit wordt later gebruikt door onze Flow-actiekaart.
     */
    setEnabled(id, enabled) {

        if (typeof enabled !== 'boolean') {
            throw new Error(
                this.homey.__(
                    'errors.invalid_enabled_value'
                )
            );
        }

        const buttons = this.getAll();

        const button = buttons.getById(id);

        if (!button) {
            throw new Error(
                this.homey.__(
                    'errors.button_id_not_found',
                    { id }
                )
            );
        }

        button.enabled = enabled;

        this.save(buttons);

        return button;
    }

    /**
 * Ja/Nee-status van een knop wijzigen.
 */
    setBooleanValue(id, value) {

        if (typeof value !== 'boolean') {
            throw new Error(
                this.homey.__(
                    'errors.invalid_boolean_value'
                )
            );
        }

        const buttons =
            this.getAll();

        const button =
            buttons.getById(id);

        if (!button) {
            throw new Error(
                this.homey.__(
                    'errors.button_id_not_found',
                    { id }
                )
            );
        }

        if (button.type !== 'boolean') {
            throw new Error(
                this.homey.__(
                    'errors.not_boolean_button',
                    { name: button.text }
                )
            );
        }

        if ((button.variableSource || 'homey') !== 'flow') {
            throw new Error(
                this.homey.__(
                    'errors.not_flow_status_button',
                    { name: button.text }
                )
            );
        }

        button.booleanValue = value;

        this.save(buttons);

        return button;
    }


    setPermanentColor(id, enabled, color) {

        if (typeof enabled !== 'boolean') {
            throw new Error(
                this.homey.__(
                    'errors.invalid_enabled_value'
                )
            );
        }

        const buttons = this.getAll();

        const button = buttons.getById(id);

        if (!button) {
            throw new Error(
                this.homey.__(
                    'errors.button_id_not_found',
                    { id }
                )
            );
        }

        button.permanentColorEnabled = enabled;

        if (
            typeof color === 'string' &&
            color
        ) {
            button.permanentColor = color;
        }

        this.save(buttons);

        return button;
    }

}

module.exports = ButtonStore;