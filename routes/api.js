'use strict';

const { GetData, CreateData, UpdateData, DeleteData } = require('../controllers/controller')

module.exports = function (app) {

  app.route('/api/issues/:project')
    .get(GetData)
    .post(CreateData)
    .put(UpdateData)
    .delete(DeleteData);
};
