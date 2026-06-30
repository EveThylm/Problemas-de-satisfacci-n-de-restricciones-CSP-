class UI {
    constructor(csp) {
        this.csp = csp;
        this.variablesContainer = document.getElementById('variables-container');
        this.addVariableBtn = document.getElementById('add-variable-btn');
        this.solveBtn = document.getElementById('solve-btn');
        this.stepBtn = document.getElementById('step-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.solutionsPanel = document.getElementById('solutions-panel');
        this.solutionsList = document.getElementById('solutions-list');
        this.solutionsCount = document.getElementById('solutions-count');

        this.defaultTasks = ['T1', 'T2', 'T3'];
        this.defaultVariables = [
            { name: 'Ana', tasks: ['T1', 'T2'] },
            { name: 'Luis', tasks: ['T1', 'T3'] },
            { name: 'Carlos', tasks: ['T2', 'T3'] }
        ];
    }

    init() {
        this.loadDefaultConfiguration();
        this.bindEvents();
    }

    loadDefaultConfiguration() {
        this.defaultVariables.forEach(variable => {
            this.addVariableCard(variable.name, variable.tasks);
            this.csp.addVariable(variable.name, variable.tasks);
        });
        this.updateProblemInfo();
    }

    addVariableCard(name, tasks = []) {
        const card = document.createElement('div');
        card.className = 'variable-card';
        card.dataset.variable = name;

        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';

        const title = document.createElement('h3');
        title.textContent = name;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-var';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => this.removeVariableCard(name);

        header.appendChild(title);
        header.appendChild(removeBtn);

        const checkboxGroup = document.createElement('div');
        checkboxGroup.className = 'checkbox-group';

        this.defaultTasks.forEach(task => {
            const label = document.createElement('label');
            label.className = 'checkbox-label';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = tasks.includes(task);
            checkbox.dataset.task = task;
            checkbox.onchange = () => this.handleTaskToggle(name, task, checkbox.checked);

            const span = document.createElement('span');
            span.textContent = task;

            label.appendChild(checkbox);
            label.appendChild(span);
            checkboxGroup.appendChild(label);
        });

        card.appendChild(header);
        card.appendChild(checkboxGroup);
        this.variablesContainer.appendChild(card);
    }

    removeVariableCard(name) {
        const card = this.variablesContainer.querySelector(`[data-variable="${name}"]`);
        if (card) {
            card.remove();
            this.csp.removeVariable(name);
            this.updateProblemInfo();
        }
    }

    handleTaskToggle(variable, task, isChecked) {
        if (isChecked) {
            this.csp.addToDomain(variable, task);
        } else {
            this.csp.removeFromDomain(variable, task);
        }
        this.updateProblemInfo();
    }

    addNewVariable() {
        const name = prompt('Ingrese el nombre de la nueva persona:');
        if (name && name.trim()) {
            const trimmedName = name.trim();
            if (!this.csp.variables[trimmedName]) {
                this.addVariableCard(trimmedName, this.defaultTasks);
                this.csp.addVariable(trimmedName, this.defaultTasks);
                this.updateProblemInfo();
            } else {
                alert('Ya existe una variable con ese nombre.');
            }
        }
    }

    updateProblemInfo() {
        const stats = this.csp.getStats();
        document.getElementById('info-variables').textContent = stats.variables;
        document.getElementById('info-domains').textContent = stats.domains;
        document.getElementById('info-constraints').textContent = stats.constraints;
    }

    showSolutions(solutions) {
        this.solutionsList.innerHTML = '';
        this.solutionsCount.textContent = solutions.length;

        solutions.forEach((solution, index) => {
            const card = document.createElement('div');
            card.className = 'solution-card';

            const title = document.createElement('h4');
            title.textContent = `Solución ${index + 1}`;
            card.appendChild(title);

            Object.entries(solution).forEach(([variable, task]) => {
                const assignment = document.createElement('div');
                assignment.className = 'solution-assignment';
                assignment.innerHTML = `${variable} <span class="arrow">→</span> ${task}`;
                card.appendChild(assignment);
            });

            this.solutionsList.appendChild(card);
        });

        this.solutionsPanel.classList.remove('hidden');
    }

    hideSolutions() {
        this.solutionsPanel.classList.add('hidden');
    }

    bindEvents() {
        this.addVariableBtn.onclick = () => this.addNewVariable();
    }

    setButtonsDisabled(disabled) {
        this.solveBtn.disabled = disabled;
        this.stepBtn.disabled = disabled;
    }

    reset() {
        this.variablesContainer.innerHTML = '';
        this.csp.variables = {};
        this.csp.domains = {};
        this.csp.constraints = [];
        this.hideSolutions();
        this.loadDefaultConfiguration();
    }
}
