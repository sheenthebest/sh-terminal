fx_version 'adamant'
game 'gta5'
lua54 'yes'

author 'sheen'
description 'Hacking Terminal'
version '1.0'

shared_scripts {
    '@ox_lib/init.lua',
}
client_scripts {
    'client/client.lua',
}

ui_page 'html/index.html'
files { 
    'config.lua',
    'html/index.html', 
    'html/script.js',
    'html/styles.css',
}

escrow_ignore {
    '**.lua',
}
