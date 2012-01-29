exports.routes = (map) ->
  map.root "home#index"
  map.all ':controller/:action'
  map.all ':controller/:action/:id'

