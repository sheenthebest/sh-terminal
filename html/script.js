const { createApp } = Vue;

createApp({
    data() {
        return {
            isVisible: false,
            showMatrix: false,
            isFirstTime: true,
            output: [],
            commandHistory: [],
            historyIndex: 0,
            commandInput: '',
            aliases: {},
            notes: [],
            matrixInterval: null,
            enableTypingAnimation: false,
            isDragging: false,
            dragOffsetX: 0,
            dragOffsetY: 0
        };
    },
    watch: {
        output: {
            handler() {
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            },
            deep: true
        }
    },
    mounted() {
        window.addEventListener('message', this.handleMessage);
        document.addEventListener('keydown', this.handleGlobalKeydown);
        
        if (this.isFirstTime) {
            this.initMatrix();
        }
    },
    beforeUnmount() {
        window.removeEventListener('message', this.handleMessage);
        document.removeEventListener('keydown', this.handleGlobalKeydown);
        if (this.matrixInterval) {
            clearInterval(this.matrixInterval);
        }
    },
    methods: {
        handleMessage(event) {
            if (event.data.action === 'SHOW_UI') {
                this.openUI();
            }
        },
        handleGlobalKeydown(event) {
            if (event.key === 'Escape' && this.isVisible) {
                this.closeUI();
            }
        },
        openUI() {
            this.isVisible = true;
            
            if (this.isFirstTime) {
                this.isFirstTime = false;
                this.showMatrix = true;
                
                // Wait for canvas to be mounted
                this.$nextTick(() => {
                    this.startMatrixAnimation();
                });
                
                setTimeout(() => {
                    this.showMatrix = false;
                    if (this.matrixInterval) {
                        clearInterval(this.matrixInterval);
                    }
                }, 2000);
                
                setTimeout(() => {
                    this.displayWelcome();
                }, 2500);
            }
        },
        closeUI() {
            this.isVisible = false;
            this.fetchNui('CLOSE_UI');
        },
        initMatrix() {
            // Matrix canvas will be handled after mount
        },
        startMatrixAnimation() {
            const canvas = document.getElementById('matrix-canvas');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const w = canvas.width = window.innerWidth;
            const h = canvas.height = window.innerHeight;
            const cols = Math.floor(w / 20) + 1;
            const ypos = Array(cols).fill(0);
            
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, w, h);
            
            this.matrixInterval = setInterval(() => {
                ctx.fillStyle = '#0001';
                ctx.fillRect(0, 0, w, h);
                
                ctx.fillStyle = '#0f0';
                ctx.font = '15pt monospace';
                
                ypos.forEach((y, ind) => {
                    const text = String.fromCharCode(Math.random() * 128);
                    const x = ind * 20;
                    ctx.fillText(text, x, y);
                    if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
                    else ypos[ind] = y + 20;
                });
            }, 50);
        },
        displayWelcome() {
            const asciiArt = [
                ' _____ _    _ ______ ______ _   _    _____  _____ _____  _____ _____ _______ _____',
                ' / ____| |  | |  ____|  ____| \\ | |  / ____|/ ____|  __ \\|_   _|  __ \\__   __/ ____|',
                '| (___ | |__| | |__  | |__  |  \\| | | (___ | |    | |__) | | | | |__) | | | | (___',
                ' \\___ \\|  __  |  __| |  __| | . ` |  \\___ \\| |    |  _  /  | | |  ___/  | |  \\___ \\',
                ' ____) | |  | | |____| |____| |\\  |  ____) | |____| | \\ \\ _| |_| |      | |  ____) |',
                '|_____/|_|  |_|______|______|_| \\_| |_____/ \\_____|_|  \\_\\_____|_|      |_| |_____/',
                '------------------------------------------------------------------------------------',
                '',
                'Welcome to the terminal',
                'Type "help" for a list of commands.'
            ];
            
            asciiArt.forEach(() => {
                this.output.push('');
            });
            this.typeAllLines(asciiArt, 0);
        },
        typeAllLines(lines, charIndex) {
            // Check if we've finished (all lines are complete)
            const maxLength = Math.max(...lines.map(line => line.length));
            if (charIndex >= maxLength) return;
            
            // Update each line
            const outputStartIndex = this.output.length - lines.length;
            lines.forEach((line, lineIndex) => {
                if (charIndex < line.length) {
                    this.output[outputStartIndex + lineIndex] = line.substring(0, charIndex + 1);
                }
            });
            
            // Continue to next character
            setTimeout(() => {
                this.typeAllLines(lines, charIndex + 1);
            }, 30);
        },
        handleKeydown(event) {
            if (event.key === 'Enter') {
                if (this.commandInput.trim()) {
                    this.executeCommand(this.commandInput.trim());
                    this.commandHistory.push(this.commandInput.trim());
                    this.historyIndex = this.commandHistory.length;
                    this.commandInput = '';
                }
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.commandInput = this.commandHistory[this.historyIndex];
                }
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (this.historyIndex < this.commandHistory.length) {
                    this.historyIndex++;
                    this.commandInput = this.commandHistory[this.historyIndex] || '';
                }
            }
        },
        executeCommand(command) {
            this.output.push(`> ${command}`);
            
            const [cmd, ...args] = command.split(' ');
            const lowerCmd = cmd.toLowerCase();
            
            // Check aliases
            const actualCmd = this.aliases[lowerCmd] || lowerCmd;
            
            // Execute command
            switch(actualCmd) {
                case 'help':
                    this.output.push('Available commands: help, clear, exit, date, history, alias, notes, find, pwgen, base64, time, testcb');
                    break;
                case 'clear':
                    this.output = [];
                    break;
                case 'exit':
                    this.output.push('Exiting...');
                    setTimeout(() => this.closeUI(), 500);
                    break;
                case 'date':
                    this.output.push(new Date().toISOString().split('T')[0]);
                    break;
                case 'history':
                    this.output.push(...this.commandHistory);
                    break;
                case 'alias':
                    this.handleAlias(args);
                    break;
                case 'notes':
                    this.handleNotes(args);
                    break;
                case 'find':
                    this.handleFind(args);
                    break;
                case 'pwgen':
                    this.output.push(Math.random().toString(36).slice(-8));
                    break;
                case 'base64':
                    this.handleBase64(args);
                    break;
                case 'time':
                    this.output.push(new Date().toLocaleTimeString());
                    break;
                case 'testcb':
                    this.handleTestCb(args);
                    break;
                default:
                    this.output.push(`Error: Command not recognized - ${command}`);
            }
            
            this.$nextTick(() => {
                this.scrollToBottom();
            });
        },
        handleAlias(args) {
            const [name, ...rest] = args;
            if (name && rest.length) {
                this.aliases[name.toLowerCase()] = rest.join(' ');
                this.output.push(`Alias set: ${name.toLowerCase()} -> ${rest.join(' ')}`);
            } else {
                this.output.push('Usage: alias <name> <command>');
            }
        },
        handleNotes(args) {
            if (args[0] === 'add') {
                this.notes.push(args.slice(1).join(' '));
                this.output.push('Note added.');
            } else if (args[0] === 'list') {
                if (this.notes.length) {
                    this.output.push(...this.notes);
                } else {
                    this.output.push('No notes found.');
                }
            } else {
                this.output.push('Usage: notes <add|list> [note]');
            }
        },
        handleFind(args) {
            const searchTerm = args.join(' ');
            const found = this.commandHistory.filter(line => line.includes(searchTerm));
            if (found.length) {
                this.output.push(...found);
            } else {
                this.output.push('No matches found.');
            }
        },
        handleBase64(args) {
            const [cmd, ...text] = args;
            const str = text.join(' ');
            if (cmd === 'encode') {
                this.output.push(btoa(str));
            } else if (cmd === 'decode') {
                try {
                    this.output.push(atob(str));
                } catch (e) {
                    this.output.push('Error: Invalid base64 string');
                }
            } else {
                this.output.push('Usage: base64 <encode|decode> <text>');
            }
        },
        async handleTestCb(args) {
            const param = args.join(' ');
            if (!param) {
                this.output.push('Usage: testcb <any>');
                return;
            }
            
            try {
                const response = await fetch(`https://${GetParentResourceName()}/TEST_CB`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(param)
                });
                const data = await response.text();
                this.output.push(`Result: ${data}`);
            } catch (error) {
                this.output.push(`Failed: ${error.message}`);
            }
        },
        fetchNui(eventName, data = {}) {
            return fetch(`https://${GetParentResourceName()}/${eventName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        },
        startDrag(event) {
            const terminal = document.querySelector('.terminal-window');
            if (!terminal) return;
            
            this.isDragging = true;
            const rect = terminal.getBoundingClientRect();
            this.dragOffsetX = event.clientX - rect.left;
            this.dragOffsetY = event.clientY - rect.top;
            
            document.addEventListener('mousemove', this.onDrag);
            document.addEventListener('mouseup', this.stopDrag);
        },
        onDrag(event) {
            if (!this.isDragging) return;
            
            const terminal = document.querySelector('.terminal-window');
            if (!terminal) return;
            
            const x = event.clientX - this.dragOffsetX;
            const y = event.clientY - this.dragOffsetY;
            
            terminal.style.position = 'absolute';
            terminal.style.left = `${x}px`;
            terminal.style.top = `${y}px`;
        },
        stopDrag() {
            this.isDragging = false;
            document.removeEventListener('mousemove', this.onDrag);
            document.removeEventListener('mouseup', this.stopDrag);
        },
        scrollToBottom() {
            const outputEl = document.querySelector('.terminal-output');
            if (outputEl) {
                outputEl.scrollTop = outputEl.scrollHeight;
            }
        }
    }
}).mount('#app');