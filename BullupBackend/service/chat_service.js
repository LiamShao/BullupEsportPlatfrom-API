var dependencyUtil = require("../util/dependency_util.js");
dependencyUtil.init(__dirname.toString().substr(0, __dirname.length - "/service".length).replace(/\\/g, "/"));
var logUtil = dependencyUtil.global.utils.logUtil;

exports.init = function () {
    
}


exports.handleChat=function(io,socket){
    socket.on('chatMsg',function(data){  
        logUtil.listenerLog('chatMsg');
        var feeback={};
        feeback.errCode=0;
        feeback.text='发送成功';
        feeback.type='SENDCHAT';
        feeback.extension={};   
        io.sockets.emit('chatMsg',data);//广播 
        //console.log(data);
    });
        //console.log("----------------------------");
}
