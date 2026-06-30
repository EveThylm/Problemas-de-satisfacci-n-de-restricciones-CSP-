class CSP {
    constructor() {
        this.variables = {};
        this.domains = {};
        this.constraints = [];
    }

    addVariable(name, domain) {
        this.variables[name] = name;
        this.domains[name] = [...domain];
        this.updateConstraints();
    }

    removeVariable(name) {
        delete this.variables[name];
        delete this.domains[name];
        this.updateConstraints();
    }

    updateDomain(variable, domain) {
        this.domains[variable] = [...domain];
        this.updateConstraints();
    }

    addToDomain(variable, task) {
        if (!this.domains[variable].includes(task)) {
            this.domains[variable].push(task);
            this.updateConstraints();
        }
    }

    removeFromDomain(variable, task) {
        const index = this.domains[variable].indexOf(task);
        if (index > -1) {
            this.domains[variable].splice(index, 1);
            this.updateConstraints();
        }
    }

    updateConstraints() {
        this.constraints = [];
        const varNames = Object.keys(this.variables);

        varNames.forEach(v => {
            this.domains[v].forEach(task => {
                this.constraints.push({
                    type: 'unary',
                    variable: v,
                    value: task
                });
            });
        });

        for (let i = 0; i < varNames.length; i++) {
            for (let j = i + 1; j < varNames.length; j++) {
                this.constraints.push({
                    type: 'binary',
                    variables: [varNames[i], varNames[j]],
                    constraint: 'different'
                });
            }
        }
    }

    getUnaryConstraints(variable) {
        return this.domains[variable] || [];
    }

    isValueConsistent(variable, value, assignment) {
        for (const [assignedVar, assignedValue] of Object.entries(assignment)) {
            if (assignedValue === value) {
                return false;
            }
        }
        return this.domains[variable].includes(value);
    }

    getUnassignedVariables(assignment) {
        return Object.keys(this.variables).filter(v => !(v in assignment));
    }

    getAllSolutions() {
        const solutions = [];
        this.backtrack({}, solutions);
        return solutions;
    }

    backtrack(assignment, solutions) {
        if (Object.keys(assignment).length === Object.keys(this.variables).length) {
            solutions.push(Utils.deepClone(assignment));
            return;
        }

        const unassigned = this.getUnassignedVariables(assignment);
        const variable = unassigned[0];

        for (const value of this.domains[variable]) {
            if (this.isValueConsistent(variable, value, assignment)) {
                assignment[variable] = value;
                this.backtrack(assignment, solutions);
                delete assignment[variable];
            }
        }
    }

    getStats() {
        return {
            variables: Object.keys(this.variables).length,
            domains: Object.keys(this.domains).length,
            constraints: this.constraints.length
        };
    }
}
