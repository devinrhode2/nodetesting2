//new mongoose version:
/*
  var mongoose = require('mongoose');
  module.exports.ready = function dbJsReady(readyCallback) {
    mongoose.createConnection('mongodb://localhost/maindb').on('open', function(db){
      //THIS MAY NOT ACTUALLY BE A MONGO DB
      readyCallback(db);
    });
  };
*/

//raw mongodb version:
  var mongo = require('mongodb'),
      Connection = mongo.Connection;
      
  
  module.exports.ready = function dbJsReady(readyCallback) {
    new mongo.Db('maindb', new mongo.Server("127.0.0.1", 27017, {}), {})
    .open(function(err, db) {
      if (err) {
        console.error('hit error in db.js initializing the db. error: ', err);
        console.error('db: ', db, 'mongo:', mongo, 'this:', this);
        throw err;
      }
      readyCallback(db);
    });
  };