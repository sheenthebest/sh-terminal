local command = 'terminal' -- name of command

-- Functions --
local function OpenUI()
    SendNUIMessage({ action = 'SHOW_UI' })
    SetNuiFocus(true, true)
end

-- NUI Callbacks --
RegisterNUICallback('CLOSE_UI', function(data, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

-- EXAMPLE CALLBACK --
RegisterNUICallback('TEST_CB', function(data, cb)
    print(json.encode(data), type(data)) -- received data

    cb(data) -- return data
end)

-- Commands --
RegisterCommand('terminal', OpenUI)
