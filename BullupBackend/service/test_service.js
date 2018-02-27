var dependencyUtil = require("../util/dependency_util.js");
var fs = require('fs');
dependencyUtil.init(__dirname.toString().substr(0, __dirname.length - "/service".length).replace(/\\/g, "/"));
var battleService = dependencyUtil.global.service.battleService;
var socketService = dependencyUtil.global.service.socketService;

exports.handleTest = function(socket){
    socket.on('test', function (data) {
        
        var battles = battleService.battles;
        var roomObj = JSON.parse(fs.readFileSync('C://Users/Public/Bullup/test_log.txt').toString());
        var gameMode = roomObj.BattleInfo.gameData.queue.gameMode;
       
        var roomPacket = {};
        roomPacket.head = "room";
        roomPacket.myTeam = roomObj.BattleInfo.gameData.teamOne;
        roomPacket.theirTeam = roomObj.BattleInfo.gameData.teamTwo;
    
        //检查数据包中的人员是否能对应上
        //通知客户端游戏已开始
        for(var battleIndex in  battles){
            var battle = battles[battleIndex];
            if(battle.status == 'unready'){
                var myTeam = roomPacket.myTeam;
                var theirTeam = roomPacket.theirTeam;
                var blueSide = battle.blueSide;
                var redSide = battle.redSide;
                var teamFlag = true;
                var orderedMap = battle.blueSide.mapSelection;
                if(orderedMap == 'map-selection-1'){
                    orderedMap = 'CLASSIC';
                }else if(orderedMap == 'map-selection-2'){
                    orderedMap = 'ARAM';
                }
                //if(myTeam[0].team == 1){
                //看蓝队人员配置是否合法
                for(var bullupPaticipantIndex in blueSide.participants){
                    var bullupPaticipant = blueSide.participants[bullupPaticipantIndex];
                    var memberExsistFlag = false;
                    var lolAccountId = bullupPaticipant.lolAccountInfo.user_lol_account;
                    for(var lolPaticipantIndex in myTeam){
                        var lolPaticipant = myTeam[lolPaticipantIndex];
                        if(lolPaticipant.summonerId == lolAccountId){
                            memberExsistFlag = true;
                            break;
                        }
                    }
                    if(!memberExsistFlag){
                        teamFlag = false;
                        break;
                    }
                }
                //看敌方 红队人员配置是否合法
                if(teamFlag){
                    for(var bullupPaticipantIndex in redSide.participants){
                        var bullupPaticipant = redSide.participants[bullupPaticipantIndex];
                        var memberExsistFlag = false;
                        var lolAccountId = bullupPaticipant.lolAccountInfo.user_lol_account;
                        for(var lolPaticipantIndex in theirTeam){
                            var lolPaticipant = theirTeam[lolPaticipantIndex];
                            if(lolPaticipant.summonerId == lolAccountId || lolPaticipant.summonerId=='0'){
                                memberExsistFlag = true;
                                break;
                            }
                        }
                        if(!memberExsistFlag){
                            teamFlag = false;
                            break;
                        }
                    }
                }
                //teamFlag = true;
                if(teamFlag && orderedMap == gameMode){
                    if(battle.status == 'unready'){
                        battle.status = 'ready';
                    }
                    socketService.stableSocketsEmit(battle.battleName, 'lolRoomEstablished', {});
                    break;
                }
            }
        }
    });

}
