class Backtracking {
    constructor(csp, tree) {
        this.csp = csp;
        this.tree = tree;
        this.solutions = [];
        this.steps = [];
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 500;
    }

    async solve(speed = 500) {
        this.speed = speed;
        this.solutions = [];
        this.steps = [];
        this.isRunning = true;
        this.isPaused = false;

        Utils.clearConsole();
        Utils.logToConsole('Iniciando algoritmo de Backtracking...', 'info');

        this.tree.clear();
        this.tree.addNode('root', 'Inicio', null, 'unexplored');

        await this.backtrack({}, 'root');

        this.isRunning = false;
        Utils.logToConsole(`Búsqueda completada. Soluciones encontradas: ${this.solutions.length}`, 'success');

        return this.solutions;
    }

    async solveStepByStep(speed = 500) {
        this.speed = speed;
        this.solutions = [];
        this.steps = [];
        this.isRunning = true;
        this.isPaused = false;

        Utils.clearConsole();
        Utils.logToConsole('Iniciando algoritmo de Backtracking (paso a paso)...', 'info');

        this.tree.clear();
        this.tree.addNode('root', 'Inicio', null, 'unexplored');

        await this.backtrackStepByStep({}, 'root');

        this.isRunning = false;
        Utils.logToConsole(`Búsqueda completada. Soluciones encontradas: ${this.solutions.length}`, 'success');

        return this.solutions;
    }

    async backtrack(assignment, parentId) {
        if (!this.isRunning) return;

        const unassigned = this.csp.getUnassignedVariables(assignment);

        if (unassigned.length === 0) {
            const nodeId = Utils.generateId();
            this.tree.addNode(nodeId, 'Solución', parentId, 'solution');
            this.solutions.push(Utils.deepClone(assignment));
            Utils.logToConsole(`¡Solución encontrada! ${JSON.stringify(assignment)}`, 'success');
            await Utils.delay(this.speed);
            return;
        }

        const variable = unassigned[0];
        const domain = this.csp.domains[variable];

        Utils.logToConsole(`Seleccionando variable: ${variable}`, 'info');
        this.tree.updateNodeStatus(parentId, 'exploring');
        await Utils.delay(this.speed);

        for (const value of domain) {
            if (!this.isRunning) return;

            const nodeId = Utils.generateId();
            const label = `${variable}=${value}`;
            this.tree.addNode(nodeId, label, parentId, 'unexplored');

            Utils.logToConsole(`Intentando ${label}`, 'info');
            await Utils.delay(this.speed);

            if (this.csp.isValueConsistent(variable, value, assignment)) {
                this.tree.updateNodeStatus(nodeId, 'exploring');
                Utils.logToConsole(`${label} es consistente`, 'success');
                await Utils.delay(this.speed);

                assignment[variable] = value;
                await this.backtrack(assignment, nodeId);
                delete assignment[variable];
            } else {
                this.tree.updateNodeStatus(nodeId, 'violated');
                Utils.logToConsole(`${label} - Restricción violada`, 'error');
                await Utils.delay(this.speed);
                this.tree.updateNodeStatus(nodeId, 'discarded');
            }
        }

        this.tree.updateNodeStatus(parentId, 'discarded');
    }

    async backtrackStepByStep(assignment, parentId) {
        if (!this.isRunning) return;

        const unassigned = this.csp.getUnassignedVariables(assignment);

        if (unassigned.length === 0) {
            const nodeId = Utils.generateId();
            this.tree.addNode(nodeId, 'Solución', parentId, 'solution');
            this.solutions.push(Utils.deepClone(assignment));
            Utils.logToConsole(`¡Solución encontrada! ${JSON.stringify(assignment)}`, 'success');
            return;
        }

        const variable = unassigned[0];
        const domain = this.csp.domains[variable];

        Utils.logToConsole(`Seleccionando variable: ${variable}`, 'info');
        this.tree.updateNodeStatus(parentId, 'exploring');

        for (const value of domain) {
            if (!this.isRunning) return;

            const nodeId = Utils.generateId();
            const label = `${variable}=${value}`;
            this.tree.addNode(nodeId, label, parentId, 'unexplored');

            Utils.logToConsole(`Intentando ${label}`, 'info');

            if (this.csp.isValueConsistent(variable, value, assignment)) {
                this.tree.updateNodeStatus(nodeId, 'exploring');
                Utils.logToConsole(`${label} es consistente`, 'success');

                assignment[variable] = value;
                await this.backtrackStepByStep(assignment, nodeId);
                delete assignment[variable];
            } else {
                this.tree.updateNodeStatus(nodeId, 'violated');
                Utils.logToConsole(`${label} - Restricción violada`, 'error');
                this.tree.updateNodeStatus(nodeId, 'discarded');
            }
        }

        this.tree.updateNodeStatus(parentId, 'discarded');
    }

    stop() {
        this.isRunning = false;
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    getSolutions() {
        return this.solutions;
    }

    getSteps() {
        return this.steps;
    }
}
