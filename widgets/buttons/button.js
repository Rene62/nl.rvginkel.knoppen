'use strict';

class Button {

    constructor({
        id,
        number = null,
        type = 'action',
        text = 'Knop',
        width = 'small',
        enabled = true,
        textAlign = 'center',

        // Action
        actionValue = '',

        // Permanente kleur
        permanentColorEnabled = false,
        permanentColor = '#00ff66',

        // Boolean
        variableSource = 'homey',
        variableId = null,
        variableName = null,
        booleanValue = false
    }) {

        this.id = id;
        this.number = number;
        this.type = type;
        this.text = text;
        this.width = width;
        this.enabled = enabled;
        this.textAlign =
            textAlign === 'left'
                ? 'left'
                : 'center';

        this.actionValue = actionValue;

        this.permanentColorEnabled = permanentColorEnabled;
        this.permanentColor = permanentColor;

        this.variableSource = variableSource;
        this.variableId = variableId;
        this.variableName = variableName;
        this.booleanValue = booleanValue;
    }


    isAction() {
        return this.type === 'action';
    }


    isBoolean() {
        return this.type === 'boolean';
    }


    isLarge() {
        return this.width === 'large';
    }


    toJSON() {

        return {
            id: this.id,
            number: this.number,
            type: this.type,
            text: this.text,
            width: this.width,
            enabled: this.enabled,
            actionValue: this.actionValue,
            permanentColorEnabled: this.permanentColorEnabled,
            permanentColor: this.permanentColor,
            variableSource: this.variableSource,
            variableId: this.variableId,
            variableName: this.variableName,
            booleanValue: this.booleanValue,
            textAlign: this.textAlign
        };
    }

}

module.exports = Button;