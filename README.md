# Hacking Terminal (for developers)

This project is a simulated hacking terminal interface for FiveM. It features a terminal window where players can enter commands, see responses, and interact with the system in a realistic manner.

**Note: This script is primarily intended for developers and is not a complete script.**

## Showcase
![Screenshot](https://forum-cfx-re.akamaized.net/original/5X/b/5/a/9/b5a97338a425231a10634c7ba902d0d0da7bd3fd.jpeg?raw=true)

## Commands
- **help**: Displays a list of available commands.
- **clear**: Clears the terminal screen.
- **exit**: Closes the terminal UI.
- **date**: Displays the current date.
- **history**: Shows the command history.
- **alias**: Sets an alias for a command. Usage: `alias <name> <command>`
- **notes**: Manages notes. Usage: `notes add <note>`, `notes list`
- **find**: Searches the command history for a term. Usage: `find <term>`
- **pwgen**: Generates a random password.
- **base64**: Encodes or decodes a string in Base64. Usage: `base64 encode <text>`, `base64 decode <text>`
- **time**: Displays the current time.
- **testcb**: Sends a test callback to the client. Usage: `testcb <any>`

### Prerequisites
- A working FiveM server.
- Basic knowledge of Lua, HTML, CSS, and JavaScript.
