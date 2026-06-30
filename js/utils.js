const Utils = {
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    },

    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    logToConsole(message, type = 'info') {
        const consoleOutput = document.getElementById('console-output');
        const entry = document.createElement('div');
        entry.className = `console-entry ${type}`;
        entry.textContent = message;
        consoleOutput.appendChild(entry);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    },

    clearConsole() {
        const consoleOutput = document.getElementById('console-output');
        consoleOutput.innerHTML = '';
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
