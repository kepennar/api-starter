
local routes = {"/available-routes", "/health"}

request = function()
  local path = routes[math.random(#routes)]
  return wrk.format('GET', path)
end
