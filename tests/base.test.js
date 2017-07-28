'use strict';

class BaseTest {
    constructor(name) {
        this.name = name;
    }

    async run() {
        throw new Error('Test run function not overridden.');
    }
}

module.exports = BaseTest;
