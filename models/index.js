const TypeORMModels = {
  User: require('./User'),
  RefreshToken: require('./RefreshToken'),
  Zone: require('./Zone'),
  GeoDataUpdate: require('./GeoDataUpdate'),
  Warehouse: require('./Warehouse'),
  Category: require('./Category'),
  Product: require('./Product'),
  Inventory: require('./Inventory'),
  Customer: require('./Customer'),
  Schedule: require('./Schedule'),
  SellingSession: require('./SellingSession'),
  Order: require('./Order'),
  OrderItem: require('./OrderItem'),
  Commission: require('./Commission'),
  ActivityLog: require('./ActivityLog'),
};

module.exports = { TypeORMModels }