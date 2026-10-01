'use strict';

class Button {

    constructor({
        id,
        number = null,
        type = 'action',
        text = 'Knop',
        width = 'small',
        enabled = true,

        // Action
        actionValue = '',

        // Boolean
        variableId = null,
        variableName = null
    }) {

        this.id = id;
        this.number = number;
        this.type = type;
        this.text = text;
        this.width = width;
        this.enabled = enabled;

        this.actionValue = actionValue;

        this.variableId = variableId;
        this.variableName = variableName;
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
            variableId: this.variableId,
            variableName: this.variableName
        };
    }

}

module.exports = Button;