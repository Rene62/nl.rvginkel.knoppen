'use strict';

const Button = require('./button');

class Buttons {

    constructor(buttons = []) {

        this.buttons = buttons.map(
            button => button instanceof Button
                ? button
                : new Button(button)
        );
    }


    // Alle knoppen ophalen
    getAll() {
        return this.buttons;
    }


    // Eén knop zoeken op ID
    getById(id) {
        return this.buttons.find(
            button => button.id === id
        ) || null;
    }


    // Knop toevoegen
    add(button) {

        const newButton =
            button instanceof Button
                ? button
                : new Button(button);

        if (this.getById(newButton.id)) {
            throw new Error(
                `Knop met ID "${newButton.id}" bestaat al`
            );
        }

        this.buttons.push(newButton);

        return newButton;
    }


    // Knop verwijderen
    remove(id) {

        const index = this.buttons.findIndex(
            button => button.id === id
        );

        if (index === -1) {
            return false;
        }

        this.buttons.splice(index, 1);

        return true;
    }


    // Geschikt om als JSON op te slaan
    toJSON() {
        return this.buttons.map(
            button => button.toJSON()
        );
    }

}

module.exports = Buttons;