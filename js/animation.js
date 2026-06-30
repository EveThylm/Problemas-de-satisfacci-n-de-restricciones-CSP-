class Animation {
    constructor() {
        this.animations = [];
        this.isAnimating = false;
    }

    async animateNode(nodeId, animationType, duration = 300) {
        const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (!nodeElement) return;

        return new Promise(resolve => {
            nodeElement.classList.add(animationType);
            setTimeout(() => {
                nodeElement.classList.remove(animationType);
                resolve();
            }, duration);
        });
    }

    async highlightNode(nodeId, duration = 500) {
        const nodeElement = document.querySelector(`.tree-node[data-node-id="${nodeId}"]`);
        if (!nodeElement) return;

        return new Promise(resolve => {
            nodeElement.classList.add('node-highlight');
            setTimeout(() => {
                nodeElement.classList.remove('node-highlight');
                resolve();
            }, duration);
        });
    }

    async fadeIn(element, duration = 300) {
        return new Promise(resolve => {
            element.style.opacity = '0';
            element.classList.add('fade-in');
            setTimeout(() => {
                element.style.opacity = '1';
                resolve();
            }, duration);
        });
    }

    async fadeOut(element, duration = 300) {
        return new Promise(resolve => {
            element.style.opacity = '1';
            element.style.transition = `opacity ${duration}ms`;
            element.style.opacity = '0';
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    async slideIn(element, direction = 'left', duration = 300) {
        const translateMap = {
            left: 'translateX(-20px)',
            right: 'translateX(20px)',
            up: 'translateY(-20px)',
            down: 'translateY(20px)'
        };

        return new Promise(resolve => {
            element.style.transform = translateMap[direction];
            element.style.opacity = '0';
            element.style.transition = `transform ${duration}ms, opacity ${duration}ms`;

            requestAnimationFrame(() => {
                element.style.transform = 'translate(0)';
                element.style.opacity = '1';
                setTimeout(resolve, duration);
            });
        });
    }

    async pulse(element, duration = 500) {
        return new Promise(resolve => {
            element.style.transition = `transform ${duration / 2}ms`;
            element.style.transform = 'scale(1.1)';

            setTimeout(() => {
                element.style.transform = 'scale(1)';
                setTimeout(resolve, duration / 2);
            }, duration / 2);
        });
    }

    clearAnimations() {
        this.animations.forEach(animation => {
            if (animation.cancel) animation.cancel();
        });
        this.animations = [];
    }
}
