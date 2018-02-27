var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser');

var dependencyUtil = require("../util/dependency_util.js");
dependencyUtil.init(__dirname.toString().substr(0, __dirname.length - "/service".length).replace(/\\/g, "/"));

var socketService = dependencyUtil.global.service.socketService;

var bullupWebDao = dependencyUtil.global.dao.bullupWebDao;
exports.bullupWeb = function(){

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:false})); 
    app.post('/',function(req,res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header('Access-Control-Allow-Headers', 'Content-Type'); 
        res.send({name:"asd"});
        var data = req.body;
        bullupWebDao.addDate(data,function(err,data){
            console.log("sove ok");
        });
    });

    app.post('/download',function(req,res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header('Access-Control-Allow-Headers', 'Content-Type'); 
        res.send({name:"asd"});   
    });

    app.listen(3002,function(){
        console.log('3002  is running');
    });
}
