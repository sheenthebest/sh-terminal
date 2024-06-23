document.addEventListener('DOMContentLoaded', () => {
    const commands = {
        help: () => 'Available commands: help, clear, exit, date, history, alias, notes, find, pwgen, base64, time, testcb',
        exit: () => {
            closeUI();
            return 'Exiting...';
        },
        clear: () => { output.innerHTML = ''; return 'Screen cleared.'; },
        date: () => new Date().toISOString().split('T')[0],
        history: () => history.join('\n'),
        alias: (args) => {
            const [name, ...rest] = args;
            if (name && rest.length) {
                aliases[name.toLowerCase()] = rest.join(' ');
                return `Alias set: ${name.toLowerCase()} -> ${rest.join(' ')}`;
            } else {
                return 'Usage: alias <name> <command>';
            }
        },
        notes: (args) => {
            if (args[0] === 'add') {
                notes.push(args.slice(1).join(' '));
                return 'Note added.';
            } else if (args[0] === 'list') {
                return notes.join('\n');
            } else {
                return 'Usage: notes <add|list> [note]';
            }
        },
        find: (args) => {
            const searchTerm = args.join(' ');
            const foundLines = history.filter(line => line.includes(searchTerm));
            return foundLines.length ? foundLines.join('\n') : 'No matches found.';
        },
        pwgen: () => Math.random().toString(36).slice(-8),
        base64: (args) => {
            const [cmd, ...text] = args;
            const str = text.join(' ');
            if (cmd === 'encode') {
                return btoa(str);
            } else if (cmd === 'decode') {
                return atob(str);
            } else {
                return 'Usage: base64 <encode|decode> <text>';
            }
        },
        time: () => new Date().toLocaleTimeString(),
        testcb: (args) => {
            const param = args.join(' ');
            if (!param) return 'Usage: testcb <any>';
    
            return new Promise((resolve, reject) => {
                $.post(`https://${GetParentResourceName()}/TEST_CB`, JSON.stringify(
                    param
                ), (data) => {
                    resolve(`Result: ${data}`);
                }).fail((error) => {
                    reject(`Failed: ${error.statusText}`);
                });
            });
        }
    };  
    
    const commandInput = document.getElementById('commandInput');
    const output = document.getElementById('output');
    const terminalWindow = document.getElementById('terminal-window');
    const terminalHeader = document.getElementById('terminal-header');
    const history = [];
    let historyIndex = 0;
    const aliases = {};
    const notes = [];
    let matrixInterval;
    let firstTime = true;
    const enableTypingAnimation = false; // toggle

    document.body.style.display = 'none';

    function startUI() {
        document.body.style.display = 'flex';
    
        const terminalWindow = document.getElementById('terminal-window');
        terminalWindow.classList.remove('fade-in', 'fade-out');
        
        if (firstTime) {
            firstTime = false;

            const canvas = document.getElementById('canv');
            const ctx = canvas.getContext('2d');
            const w = canvas.width = window.innerWidth;
            const h = canvas.height = window.innerHeight;
            const cols = Math.floor(w / 20) + 1;
            const ypos = Array(cols).fill(0);
        
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, w, h);
        
            function matrix() {
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
            }
        
            matrixInterval = setInterval(matrix, 50);

            const matrixOverlay = document.getElementById('matrix-overlay');
            matrixOverlay.classList.remove('fade-in', 'fade-out');
            matrixOverlay.style.display = 'block';

            setTimeout(() => {
                terminalWindow.classList.add('fade-in');
                matrixOverlay.classList.add('fade-out');
            }, 1000);
        
            setTimeout(() => {
                clearInterval(matrixInterval);
                matrixOverlay.style.display = 'none';
            }, 2000);
    
            setTimeout(() => {
                displayTypingAnimation(' _____ _    _ ______ ______ _   _    _____  _____ _____  _____ _____ _______ _____'); 
                displayTypingAnimation(' / ____| |  | |  ____|  ____| \\ | |  / ____|/ ____|  __ \\|_   _|  __ \\__   __/ ____|');
                displayTypingAnimation('| (___ | |__| | |__  | |__  |  \\| | | (___ | |    | |__) | | | | |__) | | | | (___');  
                displayTypingAnimation(' \\___ \\|  __  |  __| |  __| | . ` |  \\___ \\| |    |  _  /  | | |  ___/  | |  \\___ \\'); 
                displayTypingAnimation(' ____) | |  | | |____| |____| |\\  |  ____) | |____| | \\ \\ _| |_| |      | |  ____) |');
                displayTypingAnimation('|_____/|_|  |_|______|______|_| \\_| |_____/ \\_____|_|  \\_\\_____|_|      |_| |_____/');   
                displayTypingAnimation('------------------------------------------------------------------------------------');
            }, 2500);
        
            setTimeout(() => {
                displayTypingAnimation('Welcome to the terminal');
                displayTypingAnimation('Type "help" for a list of commands.'); 
            }, 3500);
        } else {
            setTimeout(() => {
                terminalWindow.classList.add('fade-in');
            }, 100);
        }
    }     

    function closeUI() {
        const terminalWindow = document.getElementById('terminal-window');
        terminalWindow.classList.add('fade-out');
        setTimeout(() => {
            terminalWindow.classList.remove('fade-in');
            document.body.style.display = 'none';
        }, 1000);
        $.post(`https://${GetParentResourceName()}/CLOSE_UI`);
    }     
    
    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = commandInput.value.trim();
            if (command) {
                history.push(command);
                historyIndex = history.length;
                executeCommand(command);
                commandInput.value = '';
            }
        } else if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                commandInput.value = history[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < history.length) {
                historyIndex++;
                commandInput.value = history[historyIndex] || '';
            }
        }
    }); 
                
    function executeCommand(command) {
        displayOutput(`> ${command}`);
        const [cmd, ...args] = command.split(' ');
        const lowerCmd = cmd.toLowerCase();
        let commandFunction = commands[lowerCmd];
    
        if (aliases[lowerCmd]) {
            commandFunction = commands[aliases[lowerCmd].toLowerCase()];
        }
    
        if (typeof commandFunction === 'function') {
            const response = commandFunction(args);
            if (response instanceof Promise) {
                response.then((output) => {
                    if (enableTypingAnimation) {
                        displayTypingAnimation(output);
                    } else {
                        displayOutput(output);
                    }
                }).catch((error) => {
                    if (enableTypingAnimation) {
                        displayTypingAnimation(error);
                    } else {
                        displayOutput(error);
                    }
                });
            } else {
                if (enableTypingAnimation) {
                    displayTypingAnimation(response);
                } else {
                    displayOutput(response);
                }
            }
        } else {
            if (enableTypingAnimation) {
                displayTypingAnimation(`Error: Command not recognized - ${command}`);
            } else {
                displayOutput(`Error: Command not recognized - ${command}`);
            }
        }
    }
    
    function displayOutput(text) {
        const response = document.createElement('div');
        response.textContent = text;
        response.className = 'custom-color';
        output.appendChild(response);
        output.scrollTop = output.scrollHeight;
    }

    function displayTypingAnimation(text, isLarge = false) {
        let index = 0;
        const response = document.createElement('div');
        response.className = 'custom-color';
        if (isLarge) {
            response.style.fontSize = '2em';
        }
        output.appendChild(response);
        const interval = setInterval(() => {
            response.textContent += text[index];
            index++;
            if (index === text.length) {
                clearInterval(interval);
                output.scrollTop = output.scrollHeight;
            }
        }, 50);
    }

    terminalHeader.addEventListener('mousedown', (e) => {
        let shiftX = e.clientX - terminalWindow.getBoundingClientRect().left;
        let shiftY = e.clientY - terminalWindow.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            terminalWindow.style.left = pageX - shiftX + 'px';
            terminalWindow.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(e) {
            moveAt(e.pageX, e.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        terminalHeader.onmouseup = () => {
            document.removeEventListener('mousemove', onMouseMove);
            terminalHeader.onmouseup = null;
        };
    });

    terminalHeader.ondragstart = () => false;

    window.addEventListener("message", (event) => {
        const data = event.data;
        const action = data.action;
        if (action === "SHOW_UI") {
            startUI();
        }
    });
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeUI();
        }
    });    
    
    /* startUI(); */
});
