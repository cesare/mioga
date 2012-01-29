Person = define "Person", ->
  property "name"
  property "screenName"
  property "active", Boolean, default: false
  property "createdAt", Date
  property "updatedAt", Date

User = define "User", ->
  property "provider"
  property "providerUid"
  property "name"

Person.hasMany User,
  as: "users"
  foreignKey: "personId"

User.belongsTo Person,
  as: "people"
  foreignKey: "personId"
