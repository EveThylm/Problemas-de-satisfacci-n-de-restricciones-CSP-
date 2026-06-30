class App {
    constructor() {
        this.csp = new CSP();
        this.tree = new Tree('tree-container');
        this.backtracking = new Backtracking(this.csp, this.tree);
        this.ui = new UI(this.csp);
        this.animation = new Animation();
    }

    init() {
        this.ui.init();
        this.bindEvents();
        this.updateStats();
    }

    bindEvents() {
        document.getElementById('solve-btn').onclick = () => this.solve();
        document.getElementById('step-btn').onclick = () => this.solveStepByStep();
        document.getElementById('reset-btn').onclick = () => this.reset();
        document.getElementById('zoom-reset-btn').onclick = () => this.tree.resetView();
    }

    async solve() {
        this.ui.setButtonsDisabled(true);
        this.tree.clear();

        const solutions = await this.backtracking.solve(300);

        this.ui.showSolutions(solutions);
        this.updateStats();
        this.ui.setButtonsDisabled(false);
    }

    async solveStepByStep() {
        this.ui.setButtonsDisabled(true);
        this.tree.clear();

        const solutions = await this.backtracking.solveStepByStep(800);

        this.ui.showSolutions(solutions);
        this.updateStats();
        this.ui.setButtonsDisabled(false);
    }

    reset() {
        this.backtracking.stop();
        this.tree.clear();
        this.ui.reset();
        Utils.clearConsole();
        this.updateStats();
    }

    updateStats() {
        const stats = this.csp.getStats();
        document.getElementById('info-variables').textContent = stats.variables;
        document.getElementById('info-domains').textContent = stats.domains;
        document.getElementById('info-constraints').textContent = stats.constraints;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
