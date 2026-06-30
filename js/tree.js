class Tree {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.nodes = new Map();
        this.links = [];
        this.svg = null;
        this.g = null;
        this.width = 0;
        this.height = 0;
        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.updateDimensions();

        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.container.appendChild(this.svg);

        this.g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.svg.appendChild(this.g);

        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;

        this.setupInteraction();

        window.addEventListener('resize', () => {
            this.updateDimensions();
            this.render();
        });
    }

    setupInteraction() {
        this.svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoomLevel = Math.max(0.3, Math.min(3, this.zoomLevel * delta));
            this.updateTransform();
        });

        this.svg.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.isDragging = true;
                this.dragStartX = e.clientX - this.panX;
                this.dragStartY = e.clientY - this.panY;
                this.svg.style.cursor = 'grabbing';
            }
        });

        this.svg.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.panX = e.clientX - this.dragStartX;
                this.panY = e.clientY - this.dragStartY;
                this.updateTransform();
            }
        });

        this.svg.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.svg.style.cursor = 'grab';
        });

        this.svg.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.svg.style.cursor = 'grab';
        });

        this.svg.style.cursor = 'grab';
    }

    updateTransform() {
        this.g.setAttribute('transform', `translate(${this.panX}, ${this.panY}) scale(${this.zoomLevel})`);
    }

    updateDimensions() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
    }

    addNode(id, label, parentId, status) {
        const node = {
            id,
            label,
            parentId,
            status,
            children: [],
            x: 0,
            y: 0
        };

        this.nodes.set(id, node);

        if (parentId && this.nodes.has(parentId)) {
            const parent = this.nodes.get(parentId);
            parent.children.push(id);
            this.links.push({ source: parentId, target: id });
        }

        this.render();
        return node;
    }

    updateNodeStatus(id, status) {
        if (this.nodes.has(id)) {
            const node = this.nodes.get(id);
            node.status = status;
            this.render();
        }
    }

    clear() {
        this.nodes.clear();
        this.links = [];
        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
        this.render();
    }

    resetView() {
        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
    }

    calculatePositions() {
        if (this.nodes.size === 0) return;

        const rootNode = Array.from(this.nodes.values()).find(n => !n.parentId);
        if (!rootNode) return;

        const levelHeight = 90;
        const nodeSpacing = 70;
        const nodeRadius = 20;

        const getSubtreeWidth = (nodeId) => {
            const node = this.nodes.get(nodeId);
            if (!node || node.children.length === 0) {
                return nodeSpacing;
            }

            let totalWidth = 0;
            for (const childId of node.children) {
                totalWidth += getSubtreeWidth(childId);
            }
            return Math.max(totalWidth, nodeSpacing);
        };

        const assignPositions = (nodeId, depth, leftX) => {
            const node = this.nodes.get(nodeId);
            if (!node) return;

            node.y = depth * levelHeight + 50;

            if (node.children.length === 0) {
                node.x = leftX + nodeSpacing / 2;
                return;
            }

            let currentX = leftX;
            for (const childId of node.children) {
                const childWidth = getSubtreeWidth(childId);
                assignPositions(childId, depth + 1, currentX);
                currentX += childWidth;
            }

            const firstChild = this.nodes.get(node.children[0]);
            const lastChild = this.nodes.get(node.children[node.children.length - 1]);
            if (firstChild && lastChild) {
                node.x = (firstChild.x + lastChild.x) / 2;
            }
        };

        const totalWidth = getSubtreeWidth(rootNode.id);
        const startX = Math.max(0, (this.width - totalWidth) / 2);
        assignPositions(rootNode.id, 0, startX);
    }

    render() {
        this.updateDimensions();
        this.calculatePositions();

        this.g.innerHTML = '';

        this.links.forEach(link => {
            const source = this.nodes.get(link.source);
            const target = this.nodes.get(link.target);

            if (source && target) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', source.x);
                line.setAttribute('y1', source.y);
                line.setAttribute('x2', target.x);
                line.setAttribute('y2', target.y);
                line.setAttribute('class', 'tree-link');
                this.g.appendChild(line);
            }
        });

        this.nodes.forEach(node => {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', `tree-node node-${node.status}`);
            group.setAttribute('data-node-id', node.id);

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', 22);
            group.appendChild(circle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y);
            text.textContent = node.label;
            group.appendChild(text);

            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = node.label;
            group.appendChild(title);

            this.g.appendChild(group);
        });
    }

    getNodeCount() {
        return this.nodes.size;
    }

    getSolutionCount() {
        return Array.from(this.nodes.values()).filter(n => n.status === 'solution').length;
    }

    getDiscardedCount() {
        return Array.from(this.nodes.values()).filter(n => n.status === 'discarded').length;
    }

    getDepth() {
        let maxDepth = 0;
        this.nodes.forEach(node => {
            const depth = this.calculateDepth(node.id);
            if (depth > maxDepth) maxDepth = depth;
        });
        return maxDepth;
    }

    calculateDepth(nodeId) {
        let depth = 0;
        let current = this.nodes.get(nodeId);
        while (current && current.parentId) {
            depth++;
            current = this.nodes.get(current.parentId);
        }
        return depth;
    }
}
