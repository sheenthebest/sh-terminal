-- functions --
local function OpenUI()
  SendNUIMessage({ action = 'SHOW_UI' })
  SetNuiFocus(true, true)
end

-- NUI Callbacks --
RegisterNUICallback('CLOSE_UI', function()
  SetNuiFocus(false, false)
end)

-- TEST CALLBACK --
RegisterNUICallback('TEST_CB', function(data, cb)
  print(json.encode(data), type(data))   -- received data

  cb(data)                               -- return data
end)

-- Commands --
if config.command then
  RegisterCommand(config.command, OpenUI)

  if config.keybind then
    RegisterKeyMapping(config.command, 'Guidebook', 'keyboard', config.keybind)
  end
end
