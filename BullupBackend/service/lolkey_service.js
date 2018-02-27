var fs = require('fs');
var dependencyUtil = require("../util/dependency_util.js");
dependencyUtil.init(__dirname.toString().substr(0, __dirname.length - "/service".length).replace(/\\/g, "/"));
var logUtil = dependencyUtil.global.utils.logUtil;


var userService = dependencyUtil.global.service.userService;
var socketService = dependencyUtil.global.service.socketService;

exports.init = function () {
    var key = fs.readFileSync(dependencyUtil.global.utils.pathUtil.paths.otherPaths.lolKeyTextPath).toString();
    this.lolApiKey = key;
}


exports.handleLOLKeyRequest = function(socket){
    socket.on('LOLKeyRequest', function(){
        socketService.stableSocketEmit(socket, 'feedback', {
            'errorCode': 0,
            'text': '',
            'type': 'LOLKEYREQUESTRESULT',
            'extension': {
                'key': exports.lolApiKey
            }
        });
    });
}


exports.handleLOLKeyUpdate = function(socket){
    socket.on('lolKeyUpdate', function(){
        var userId = socketService.mapSocketToUserId(socket.id);
        var user = userService.users[userId];
        if(user.userRole == 1){
            //管理员 更新key
            var key = fs.readFileSync("./other/key.txt").toString();
            exports.lolApiKey = key;
            socketService.stableSocketEmit(socket, 'feedback', {
                'errorCode': 0,
                'text': 'LOL数据接口密钥更新成功',
                'type': 'LOLUPDATERESULT',
                'extension': null
            });
        }else{
            socketService.stableSocketEmit(socket, 'feedback', {
                'errorCode': 1,
                'text': 'LOL数据接口密钥更新失败',
                'type': 'LOLUPDATERESULT',
                'extension': null
            });
        }
        
    });
}