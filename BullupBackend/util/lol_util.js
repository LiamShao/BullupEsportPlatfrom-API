var request = require('request');
var async = require('async');

var apiKey =  "RGAPI-7ff17f0a-ea84-473e-ae8a-f1ca75052c6e";

function getItemsStaticData(callback){
    var options = {
        url: 'https://na1.api.riotgames.com/lol/static-data/v3/items?locale=zh_CN',
        headers: {
            "Origin": "https://developer.riotgames.com",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Riot-Token": apiKey,
            "Accept-Language": "zh-CN,zh;q=0.8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"
        }
    };
    request(options, function(error, response, body){
        bodyObj = JSON.parse(body);
        var dataObj = bodyObj.data;
        callback(dataObj);
    });
}

function getChampionsStaticData(callback){
    var options = {
        url: 'https://na1.api.riotgames.com/lol/static-data/v3/champions?locale=zh_CN&dataById=true',
        headers: {
            "Origin": "https://developer.riotgames.com",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Riot-Token": apiKey,
            "Accept-Language": "zh-CN,zh;q=0.8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"
        }
    };
    request(options, function(error, response, body){
        bodyObj = JSON.parse(body);
        var dataObj = bodyObj.data;
        callback(dataObj);
    });
}

function getSummonerByName(name, callback){
    var options = {
        url: 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+name,
        headers: {
            "Origin": "https://developer.riotgames.com",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Riot-Token": apiKey,
            "Accept-Language": "zh-CN,zh;q=0.8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"
        }
    };
    request(options, function(error, response, body){
        bodyObj = JSON.parse(body);
        callback(bodyObj);
    });
}

function getMatchesListByAccountId(accountId, startTimeStr, endTimeStr, callback){
    var startTime = (new Date(startTimeStr)).getTime(); 
    var endTime = (new Date(endTimeStr)).getTime();
    var options = {
        url: 'https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/' + accountId + '?beginTime=' + startTime + '&endTime=' + endTime,
        headers: {
            "Origin": "https://developer.riotgames.com",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Riot-Token": apiKey,
            "Accept-Language": "zh-CN,zh;q=0.8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"
        }
    };
    request(options, function(error, response, body){
        bodyObj = JSON.parse(body);
        callback(bodyObj);
    });
}

function getMatchDetailsByGameId(gameId, callback){
    var options = {
        url: 'https://na1.api.riotgames.com/lol/match/v3/matches/' + gameId,
        headers: {
            "Origin": "https://developer.riotgames.com",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Riot-Token": apiKey,
            "Accept-Language": "zh-CN,zh;q=0.8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"
        }
    };
    request(options, function(error, response, body){
        bodyObj = JSON.parse(body);
        callback(bodyObj);
    });
}

exports.getRecentMatchDetailsBySummonerName = function(name, callback){
    getSummonerByName(name, function(summonerInfo){
        var options = {
            url: 'https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/'+ summonerInfo.accountId +'/recent',
            headers: {
                "Origin": "https://developer.riotgames.com",
                "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Riot-Token": apiKey,
                "Accept-Language": "zh-CN,zh;q=0.8",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36"
            }
        };
        request(options, function(error, response, body){
            bodyObj = JSON.parse(body);
            callback(bodyObj);
        }); 
    });
}

exports.getMatchDetailsBySummonerName = function(name,startTime,endTime,callback){
    async.waterfall([
        function(done){
            getSummonerByName(name, function(summoner){
                if(summoner.accountId == undefined){
                    done("err", null);
                }else{
                    done(null, summoner);
                }
            });
        },
        function(summoner, done){
            getMatchesListByAccountId(summoner.accountId, startTime, endTime, function(gameList){
                if(gameList.totalGames == undefined){
                    done("err", null);
                }else{
                    done(null, summoner, gameList);
                }
            });
        },
        function(summoner, gameList, done){
            var matchDetails = {};
            async.eachSeries(gameList.matches, function(match, errCb){
                getMatchDetailsByGameId(match.gameId, function(details){
                    if(details.mapId == undefined){
                        matchDetails.error = "error";
                    }else{
                        matchDetails[match.gameId] = details;
                    }
                    errCb();
                });
            }, function(err) {
                if (err) console.log(err);
                matchDetails.summoner = summoner;
                if(matchDetails.error == "error"){
                    done("err", null);
                }else{
                    done(null, matchDetails);
                }
            });
        }
    ],function(err,matchDetails){
        var count = 0;
        var result = {};
        result.matches =[];
        if(err){
            callback(null);
        }else{
            for(var gameId in matchDetails){
                if(gameId == 'summoner'){
                    continue;
                }
                var match = matchDetails[gameId];
                var mainPlayerParticipantId;
                result.matches[count] = {};
                result.matches[count].name = matchDetails.summoner.name;
                result.matches[count].gameMode = match.gameMode;
                result.matches[count].gameType = match.gameType;
                var date = new Date(match.gameCreation);
                result.matches[count].time = date.getFullYear() + '/' + date.getMonth() + '/' + date.getDay();
                result.matches[count].paticipants = [];

                var paticipantCount = 0;
                var paticipantIds = [];
                for(var index in match.participantIdentities){
                    paticipantIds[paticipantCount] = match.participantIdentities[index].player.participantId;
                    if(result.matches[count].name == match.participantIdentities[index].player.summonerName){
                        mainPlayerParticipantId = match.participantIdentities[index].participantId;
                    }
                    paticipantCount++;
                }

                paticipantCount = 0;
                for(var index in match.participants){
                    if(match.participants[index].participantId == mainPlayerParticipantId){
                        result.matches[count].championId = match.participants[index].championId;
                        result.matches[count].championChineseName = exports.getChampionChineseNameById(match.participants[index].championId);
                        result.matches[count].championEnglishName = exports.getChampionEnglishNameById(match.participants[index].championId);
                        if(match.participants[index].stats.win){
                            result.matches[count].win = '胜利';
                        }else{
                            result.matches[count].win = '失败';
                        }
                        result.matches[count].kda = match.participants[index].stats.kills + '/' + match.participants[index].stats.deaths + '/' + match.participants[index].stats.assists;

                    }
                    result.matches[count].paticipants[paticipantCount] = {};
                    result.matches[count].paticipants[paticipantCount].name = match.participantIdentities[match.participants[index].participantId - 1].player.summonerName;
                    result.matches[count].paticipants[paticipantCount].kda = match.participants[index].stats.kills + '/' + match.participants[index].stats.deaths + '/' + match.participants[index].stats.assists;
                    result.matches[count].paticipants[paticipantCount].kdaScore = ((match.participants[index].stats.kills + match.participants[index].stats.assists) / (match.participants[index].stats.deaths + 1.2)).toFixed(1);
                    result.matches[count].paticipants[paticipantCount].damage = match.participants[index].stats.totalDamageDealtToChampions;
                    result.matches[count].paticipants[paticipantCount].damageTaken = match.participants[index].stats.totalDamageTaken;
                    result.matches[count].paticipants[paticipantCount].goldEarned = match.participants[index].stats.goldEarned;
                    result.matches[count].paticipants[paticipantCount].championEnglishName = exports.getChampionEnglishNameById(match.participants[index].championId);
                    result.matches[count].paticipants[paticipantCount].items = {};
                    result.matches[count].paticipants[paticipantCount].items['item0'] = match.participants[index].stats.item0;
                    result.matches[count].paticipants[paticipantCount].items['item1'] = match.participants[index].stats.item1;
                    result.matches[count].paticipants[paticipantCount].items['item2'] = match.participants[index].stats.item2;
                    result.matches[count].paticipants[paticipantCount].items['item3'] = match.participants[index].stats.item3;
                    result.matches[count].paticipants[paticipantCount].items['item4'] = match.participants[index].stats.item4;
                    result.matches[count].paticipants[paticipantCount].items['item5'] = match.participants[index].stats.item5;
                    result.matches[count].paticipants[paticipantCount].items['item6'] = match.participants[index].stats.item6;
                    paticipantCount++;
                }
                count++;
            }
            //console.log(result);
            callback(result);
        }
        /*
    //-------------------------------result-data-example----------------------------------/
        {
            "matches" : [
                {
                    "name" : "Who is 55Kai",
                    "championId" : "1",
                    "championChineseName" : "黑暗之女",
                    "championEnglishName" : "Annie",
                    "gameMode" : "CLASSIC",
                    "gameType" : "MATCHED_GAME",
                    "time" : "2017-05-09 15:34:03",
                    "kda" : "13/0/9",
                    "win" : true,
                    "paticipants" : [
                        {
                            "name" : "Who is 55Kai",
                            "kda" : "13/0/9",
                            "kdaScore" : "13.5",
                            "damage" : "20000",
                            "damageTaken": "15000",
                            "goldEarned" : "12000",
                            "items" : {
                                "item0" : 1,
                                "item1" : 1,
                                "item2" : 1,
                                "item3" : 1,
                                "item4" : 1,
                                "item5" : 1,
                                "item6" : 1
                            }
                        }
                        ...
                    ]

                }
                ...
            ]
        }
    */
    });
}

//--------------------------------------test--------------------------------------------/

// exports.getMatchDetailsBySummonerName("Who is 55Kai", "2017/9/1", "2017/9/29", function(data){
    
//         var data = data;
//         console.log(JSON.stringify(data));
//     });

// getChampionsStaticData(function(obj){
//     var count = 0;
//     for(var index in obj){
//         count++;
//         console.log("id:" + obj[index].id + " name:" + obj[index].name);
//     }
//     console.log(count);
// });

// getItemsStaticData(function(obj){
//     for(var index in obj){
//         console.log("id:" + obj[index].id + " name:" + obj[index].name);
//     }
// });

// getRecentMatchesListByAccountId(220718535, function(matches){
//     console.log(matches.matches[0].champion);
//     console.log(matches.matches[0].gameId);
// });

// getMatchDetailsByGameId(2564449052, function(gameInfo){
//     console.log(JSON.stringify(gameInfo));
// });

var champions = {
    "keys": {
        "1": "Annie",
        "2": "Olaf",
        "3": "Galio",
        "4": "TwistedFate",
        "5": "XinZhao",
        "6": "Urgot",
        "7": "Leblanc",
        "8": "Vladimir",
        "9": "Fiddlesticks",
        "10": "Kayle",
        "11": "MasterYi",
        "12": "Alistar",
        "13": "Ryze",
        "14": "Sion",
        "15": "Sivir",
        "16": "Soraka",
        "17": "Teemo",
        "18": "Tristana",
        "19": "Warwick",
        "20": "Nunu",
        "21": "MissFortune",
        "22": "Ashe",
        "23": "Tryndamere",
        "24": "Jax",
        "25": "Morgana",
        "26": "Zilean",
        "27": "Singed",
        "28": "Evelynn",
        "29": "Twitch",
        "30": "Karthus",
        "31": "Chogath",
        "32": "Amumu",
        "33": "Rammus",
        "34": "Anivia",
        "35": "Shaco",
        "36": "DrMundo",
        "37": "Sona",
        "38": "Kassadin",
        "39": "Irelia",
        "40": "Janna",
        "41": "Gangplank",
        "42": "Corki",
        "43": "Karma",
        "44": "Taric",
        "45": "Veigar",
        "48": "Trundle",
        "50": "Swain",
        "51": "Caitlyn",
        "53": "Blitzcrank",
        "54": "Malphite",
        "55": "Katarina",
        "56": "Nocturne",
        "57": "Maokai",
        "58": "Renekton",
        "59": "JarvanIV",
        "60": "Elise",
        "61": "Orianna",
        "62": "MonkeyKing",
        "63": "Brand",
        "64": "LeeSin",
        "67": "Vayne",
        "68": "Rumble",
        "69": "Cassiopeia",
        "72": "Skarner",
        "74": "Heimerdinger",
        "75": "Nasus",
        "76": "Nidalee",
        "77": "Udyr",
        "78": "Poppy",
        "79": "Gragas",
        "80": "Pantheon",
        "81": "Ezreal",
        "82": "Mordekaiser",
        "83": "Yorick",
        "84": "Akali",
        "85": "Kennen",
        "86": "Garen",
        "89": "Leona",
        "90": "Malzahar",
        "91": "Talon",
        "92": "Riven",
        "96": "KogMaw",
        "98": "Shen",
        "99": "Lux",
        "101": "Xerath",
        "102": "Shyvana",
        "103": "Ahri",
        "104": "Graves",
        "105": "Fizz",
        "106": "Volibear",
        "107": "Rengar",
        "110": "Varus",
        "111": "Nautilus",
        "112": "Viktor",
        "113": "Sejuani",
        "114": "Fiora",
        "115": "Ziggs",
        "117": "Lulu",
        "119": "Draven",
        "120": "Hecarim",
        "121": "Khazix",
        "122": "Darius",
        "126": "Jayce",
        "127": "Lissandra",
        "131": "Diana",
        "133": "Quinn",
        "134": "Syndra",
        "136": "AurelionSol",
        "141": "Kayn",
        "143": "Zyra",
        "150": "Gnar",
        "154": "Zac",
        "157": "Yasuo",
        "161": "Velkoz",
        "163": "Taliyah",
        "164": "Camille",
        "201": "Braum",
        "202": "Jhin",
        "203": "Kindred",
        "222": "Jinx",
        "223": "TahmKench",
        "236": "Lucian",
        "238": "Zed",
        "240": "Kled",
        "245": "Ekko",
        "254": "Vi",
        "266": "Aatrox",
        "267": "Nami",
        "268": "Azir",
        "412": "Thresh",
        "420": "Illaoi",
        "421": "RekSai",
        "427": "Ivern",
        "429": "Kalista",
        "432": "Bard",
        "497": "Rakan",
        "498": "Xayah"
    },
    "type": "champion",
    "version": "7.15.1",
    "data": {
        "MonkeyKing": {
            "title": "孙悟空",
            "id": 62,
            "key": "MonkeyKing",
            "name": "齐天大圣"
        },
        "Jax": {
            "title": "贾克斯",
            "id": 24,
            "key": "Jax",
            "name": "武器大师"
        },
        "Fiddlesticks": {
            "title": "费德提克",
            "id": 9,
            "key": "Fiddlesticks",
            "name": "末日使者"
        },
        "Shaco": {
            "title": "萨科",
            "id": 35,
            "key": "Shaco",
            "name": "恶魔小丑"
        },
        "Warwick": {
            "title": "沃里克",
            "id": 19,
            "key": "Warwick",
            "name": "祖安怒兽"
        },
        "Xayah": {
            "title": "霞",
            "id": 498,
            "key": "Xayah",
            "name": "逆羽"
        },
        "Nidalee": {
            "title": "奈德丽",
            "id": 76,
            "key": "Nidalee",
            "name": "狂野女猎手"
        },
        "Zyra": {
            "title": "婕拉",
            "id": 143,
            "key": "Zyra",
            "name": "荆棘之兴"
        },
        "Kled": {
            "title": "克烈",
            "id": 240,
            "key": "Kled",
            "name": "暴怒骑士"
        },
        "Brand": {
            "title": "布兰德",
            "id": 63,
            "key": "Brand",
            "name": "复仇焰魂"
        },
        "Rammus": {
            "title": "拉莫斯",
            "id": 33,
            "key": "Rammus",
            "name": "披甲龙龟"
        },
        "Illaoi": {
            "title": "俄洛伊",
            "id": 420,
            "key": "Illaoi",
            "name": "海兽祭司"
        },
        "Corki": {
            "title": "库奇",
            "id": 42,
            "key": "Corki",
            "name": "英勇投弹手"
        },
        "Braum": {
            "title": "布隆",
            "id": 201,
            "key": "Braum",
            "name": "弗雷尔卓德之心"
        },
        "Darius": {
            "title": "德莱厄斯",
            "id": 122,
            "key": "Darius",
            "name": "诺克萨斯之手"
        },
        "Tryndamere": {
            "title": "泰达米尔",
            "id": 23,
            "key": "Tryndamere",
            "name": "蛮族之王"
        },
        "MissFortune": {
            "title": "厄运小姐",
            "id": 21,
            "key": "MissFortune",
            "name": "赏金猎人"
        },
        "Yorick": {
            "title": "约里克",
            "id": 83,
            "key": "Yorick",
            "name": "牧魂人"
        },
        "Xerath": {
            "title": "泽拉斯",
            "id": 101,
            "key": "Xerath",
            "name": "远古巫灵"
        },
        "Sivir": {
            "title": "希维尔",
            "id": 15,
            "key": "Sivir",
            "name": "战争女神"
        },
        "Riven": {
            "title": "锐雯",
            "id": 92,
            "key": "Riven",
            "name": "放逐之刃"
        },
        "Orianna": {
            "title": "奥莉安娜",
            "id": 61,
            "key": "Orianna",
            "name": "发条魔灵"
        },
        "Gangplank": {
            "title": "普朗克",
            "id": 41,
            "key": "Gangplank",
            "name": "海洋之灾"
        },
        "Malphite": {
            "title": "墨菲特",
            "id": 54,
            "key": "Malphite",
            "name": "熔岩巨兽"
        },
        "Poppy": {
            "title": "波比",
            "id": 78,
            "key": "Poppy",
            "name": "圣锤之毅"
        },
        "Karthus": {
            "title": "卡尔萨斯",
            "id": 30,
            "key": "Karthus",
            "name": "死亡颂唱者"
        },
        "Jayce": {
            "title": "杰斯",
            "id": 126,
            "key": "Jayce",
            "name": "未来守护者"
        },
        "Nunu": {
            "title": "努努",
            "id": 20,
            "key": "Nunu",
            "name": "雪人骑士"
        },
        "Trundle": {
            "title": "特朗德尔",
            "id": 48,
            "key": "Trundle",
            "name": "巨魔之王"
        },
        "Graves": {
            "title": "格雷福斯",
            "id": 104,
            "key": "Graves",
            "name": "法外狂徒"
        },
        "Morgana": {
            "title": "莫甘娜",
            "id": 25,
            "key": "Morgana",
            "name": "堕落天使"
        },
        "Gnar": {
            "title": "纳尔",
            "id": 150,
            "key": "Gnar",
            "name": "迷失之牙"
        },
        "Lux": {
            "title": "拉克丝",
            "id": 99,
            "key": "Lux",
            "name": "光辉女郎"
        },
        "Shyvana": {
            "title": "希瓦娜",
            "id": 102,
            "key": "Shyvana",
            "name": "龙血武姬"
        },
        "Renekton": {
            "title": "雷克顿",
            "id": 58,
            "key": "Renekton",
            "name": "荒漠屠夫"
        },
        "Fiora": {
            "title": "菲奥娜",
            "id": 114,
            "key": "Fiora",
            "name": "无双剑姬"
        },
        "Jinx": {
            "title": "金克丝",
            "id": 222,
            "key": "Jinx",
            "name": "暴走萝莉"
        },
        "Kalista": {
            "title": "卡莉丝塔",
            "id": 429,
            "key": "Kalista",
            "name": "复仇之矛"
        },
        "Fizz": {
            "title": "菲兹",
            "id": 105,
            "key": "Fizz",
            "name": "潮汐海灵"
        },
        "Kassadin": {
            "title": "卡萨丁",
            "id": 38,
            "key": "Kassadin",
            "name": "虚空行者"
        },
        "Sona": {
            "title": "娑娜",
            "id": 37,
            "key": "Sona",
            "name": "琴瑟仙女"
        },
        "Irelia": {
            "title": "艾瑞莉娅",
            "id": 39,
            "key": "Irelia",
            "name": "刀锋意志"
        },
        "Viktor": {
            "title": "维克托",
            "id": 112,
            "key": "Viktor",
            "name": "机械先驱"
        },
        "Rakan": {
            "title": "洛",
            "id": 497,
            "key": "Rakan",
            "name": "幻翎"
        },
        "Kindred": {
            "title": "千珏",
            "id": 203,
            "key": "Kindred",
            "name": "永猎双子"
        },
        "Cassiopeia": {
            "title": "卡西奥佩娅",
            "id": 69,
            "key": "Cassiopeia",
            "name": "魔蛇之拥"
        },
        "Maokai": {
            "title": "茂凯",
            "id": 57,
            "key": "Maokai",
            "name": "扭曲树精"
        },
        "Thresh": {
            "title": "锤石",
            "id": 412,
            "key": "Thresh",
            "name": "魂锁典狱长"
        },
        "Kayle": {
            "title": "凯尔",
            "id": 10,
            "key": "Kayle",
            "name": "审判天使"
        },
        "Hecarim": {
            "title": "赫卡里姆",
            "id": 120,
            "key": "Hecarim",
            "name": "战争之影"
        },
        "Khazix": {
            "title": "卡兹克",
            "id": 121,
            "key": "Khazix",
            "name": "虚空掠夺者"
        },
        "Olaf": {
            "title": "奥拉夫",
            "id": 2,
            "key": "Olaf",
            "name": "狂战士"
        },
        "Ziggs": {
            "title": "吉格斯",
            "id": 115,
            "key": "Ziggs",
            "name": "爆破鬼才"
        },
        "Syndra": {
            "title": "辛德拉",
            "id": 134,
            "key": "Syndra",
            "name": "暗黑元首"
        },
        "DrMundo": {
            "title": "蒙多医生",
            "id": 36,
            "key": "DrMundo",
            "name": "祖安狂人"
        },
        "Karma": {
            "title": "卡尔玛",
            "id": 43,
            "key": "Karma",
            "name": "天启者"
        },
        "Annie": {
            "title": "安妮",
            "id": 1,
            "key": "Annie",
            "name": "黑暗之女"
        },
        "Akali": {
            "title": "阿卡丽",
            "id": 84,
            "key": "Akali",
            "name": "暗影之拳"
        },
        "Volibear": {
            "title": "沃利贝尔",
            "id": 106,
            "key": "Volibear",
            "name": "雷霆咆哮"
        },
        "Yasuo": {
            "title": "亚索",
            "id": 157,
            "key": "Yasuo",
            "name": "疾风剑豪"
        },
        "Kennen": {
            "title": "凯南",
            "id": 85,
            "key": "Kennen",
            "name": "狂暴之心"
        },
        "Rengar": {
            "title": "雷恩加尔",
            "id": 107,
            "key": "Rengar",
            "name": "傲之追猎者"
        },
        "Ryze": {
            "title": "瑞兹",
            "id": 13,
            "key": "Ryze",
            "name": "符文法师"
        },
        "Shen": {
            "title": "慎",
            "id": 98,
            "key": "Shen",
            "name": "暮光之眼"
        },
        "Zac": {
            "title": "扎克",
            "id": 154,
            "key": "Zac",
            "name": "生化魔人"
        },
        "Talon": {
            "title": "泰隆",
            "id": 91,
            "key": "Talon",
            "name": "刀锋之影"
        },
        "Swain": {
            "title": "斯维因",
            "id": 50,
            "key": "Swain",
            "name": "策士统领"
        },
        "Bard": {
            "title": "巴德",
            "id": 432,
            "key": "Bard",
            "name": "星界游神"
        },
        "Sion": {
            "title": "赛恩",
            "id": 14,
            "key": "Sion",
            "name": "亡灵战神"
        },
        "Vayne": {
            "title": "薇恩",
            "id": 67,
            "key": "Vayne",
            "name": "暗夜猎手"
        },
        "Nasus": {
            "title": "内瑟斯",
            "id": 75,
            "key": "Nasus",
            "name": "沙漠死神"
        },
        "Kayn": {
            "title": "凯隐",
            "id": 141,
            "key": "Kayn",
            "name": "影流之镰"
        },
        "TwistedFate": {
            "title": "崔斯特",
            "id": 4,
            "key": "TwistedFate",
            "name": "卡牌大师"
        },
        "Chogath": {
            "title": "科加斯",
            "id": 31,
            "key": "Chogath",
            "name": "虚空恐惧"
        },
        "Udyr": {
            "title": "乌迪尔",
            "id": 77,
            "key": "Udyr",
            "name": "兽灵行者"
        },
        "Lucian": {
            "title": "卢锡安",
            "id": 236,
            "key": "Lucian",
            "name": "圣枪游侠"
        },
        "Ivern": {
            "title": "艾翁",
            "id": 427,
            "key": "Ivern",
            "name": "翠神"
        },
        "Leona": {
            "title": "蕾欧娜",
            "id": 89,
            "key": "Leona",
            "name": "曙光女神"
        },
        "Caitlyn": {
            "title": "凯特琳",
            "id": 51,
            "key": "Caitlyn",
            "name": "皮城女警"
        },
        "Sejuani": {
            "title": "瑟庄妮",
            "id": 113,
            "key": "Sejuani",
            "name": "北地之怒"
        },
        "Nocturne": {
            "title": "魔腾",
            "id": 56,
            "key": "Nocturne",
            "name": "永恒梦魇"
        },
        "Zilean": {
            "title": "基兰",
            "id": 26,
            "key": "Zilean",
            "name": "时光守护者"
        },
        "Azir": {
            "title": "阿兹尔",
            "id": 268,
            "key": "Azir",
            "name": "沙漠皇帝"
        },
        "Rumble": {
            "title": "兰博",
            "id": 68,
            "key": "Rumble",
            "name": "机械公敌"
        },
        "Taliyah": {
            "title": "塔莉垭",
            "id": 163,
            "key": "Taliyah",
            "name": "岩雀"
        },
        "Teemo": {
            "title": "提莫",
            "id": 17,
            "key": "Teemo",
            "name": "迅捷斥候"
        },
        "Urgot": {
            "title": "厄加特",
            "id": 6,
            "key": "Urgot",
            "name": "无畏战车"
        },
        "Amumu": {
            "title": "阿木木",
            "id": 32,
            "key": "Amumu",
            "name": "殇之木乃伊"
        },
        "Galio": {
            "title": "加里奥",
            "id": 3,
            "key": "Galio",
            "name": "正义巨像"
        },
        "Heimerdinger": {
            "title": "黑默丁格",
            "id": 74,
            "key": "Heimerdinger",
            "name": "大发明家"
        },
        "Anivia": {
            "title": "艾尼维亚",
            "id": 34,
            "key": "Anivia",
            "name": "冰晶凤凰"
        },
        "Ashe": {
            "title": "艾希",
            "id": 22,
            "key": "Ashe",
            "name": "寒冰射手"
        },
        "Velkoz": {
            "title": "维克兹",
            "id": 161,
            "key": "Velkoz",
            "name": "虚空之眼"
        },
        "Singed": {
            "title": "辛吉德",
            "id": 27,
            "key": "Singed",
            "name": "炼金术士"
        },
        "Skarner": {
            "title": "斯卡纳",
            "id": 72,
            "key": "Skarner",
            "name": "水晶先锋"
        },
        "Varus": {
            "title": "韦鲁斯",
            "id": 110,
            "key": "Varus",
            "name": "惩戒之箭"
        },
        "Twitch": {
            "title": "图奇",
            "id": 29,
            "key": "Twitch",
            "name": "瘟疫之源"
        },
        "Garen": {
            "title": "盖伦",
            "id": 86,
            "key": "Garen",
            "name": "德玛西亚之力"
        },
        "Blitzcrank": {
            "title": "布里茨",
            "id": 53,
            "key": "Blitzcrank",
            "name": "蒸汽机器人"
        },
        "MasterYi": {
            "title": "易",
            "id": 11,
            "key": "MasterYi",
            "name": "无极剑圣"
        },
        "Elise": {
            "title": "伊莉丝",
            "id": 60,
            "key": "Elise",
            "name": "蜘蛛女皇"
        },
        "Alistar": {
            "title": "阿利斯塔",
            "id": 12,
            "key": "Alistar",
            "name": "牛头酋长"
        },
        "Katarina": {
            "title": "卡特琳娜",
            "id": 55,
            "key": "Katarina",
            "name": "不祥之刃"
        },
        "Ekko": {
            "title": "艾克",
            "id": 245,
            "key": "Ekko",
            "name": "时间刺客"
        },
        "Mordekaiser": {
            "title": "莫德凯撒",
            "id": 82,
            "key": "Mordekaiser",
            "name": "铁铠冥魂"
        },
        "Lulu": {
            "title": "璐璐",
            "id": 117,
            "key": "Lulu",
            "name": "仙灵女巫"
        },
        "Camille": {
            "title": "卡蜜尔",
            "id": 164,
            "key": "Camille",
            "name": "青钢影"
        },
        "Aatrox": {
            "title": "亚托克斯",
            "id": 266,
            "key": "Aatrox",
            "name": "暗裔剑魔"
        },
        "Draven": {
            "title": "德莱文",
            "id": 119,
            "key": "Draven",
            "name": "荣耀行刑官"
        },
        "TahmKench": {
            "title": "塔姆",
            "id": 223,
            "key": "TahmKench",
            "name": "河流之王"
        },
        "Pantheon": {
            "title": "潘森",
            "id": 80,
            "key": "Pantheon",
            "name": "战争之王"
        },
        "XinZhao": {
            "title": "赵信",
            "id": 5,
            "key": "XinZhao",
            "name": "德邦总管"
        },
        "AurelionSol": {
            "title": "奥瑞利安·索尔",
            "id": 136,
            "key": "AurelionSol",
            "name": "铸星龙王"
        },
        "LeeSin": {
            "title": "李青",
            "id": 64,
            "key": "LeeSin",
            "name": "盲僧"
        },
        "Taric": {
            "title": "塔里克",
            "id": 44,
            "key": "Taric",
            "name": "瓦洛兰之盾"
        },
        "Malzahar": {
            "title": "玛尔扎哈",
            "id": 90,
            "key": "Malzahar",
            "name": "虚空先知"
        },
        "Lissandra": {
            "title": "丽桑卓",
            "id": 127,
            "key": "Lissandra",
            "name": "冰霜女巫"
        },
        "Diana": {
            "title": "黛安娜",
            "id": 131,
            "key": "Diana",
            "name": "皎月女神"
        },
        "Tristana": {
            "title": "崔丝塔娜",
            "id": 18,
            "key": "Tristana",
            "name": "麦林炮手"
        },
        "RekSai": {
            "title": "雷克塞",
            "id": 421,
            "key": "RekSai",
            "name": "虚空遁地兽"
        },
        "Vladimir": {
            "title": "弗拉基米尔",
            "id": 8,
            "key": "Vladimir",
            "name": "猩红收割者"
        },
        "JarvanIV": {
            "title": "嘉文四世",
            "id": 59,
            "key": "JarvanIV",
            "name": "德玛西亚皇子"
        },
        "Nami": {
            "title": "娜美",
            "id": 267,
            "key": "Nami",
            "name": "唤潮鲛姬"
        },
        "Jhin": {
            "title": "烬",
            "id": 202,
            "key": "Jhin",
            "name": "戏命师"
        },
        "Soraka": {
            "title": "索拉卡",
            "id": 16,
            "key": "Soraka",
            "name": "众星之子"
        },
        "Veigar": {
            "title": "维迦",
            "id": 45,
            "key": "Veigar",
            "name": "邪恶小法师"
        },
        "Janna": {
            "title": "迦娜",
            "id": 40,
            "key": "Janna",
            "name": "风暴之怒"
        },
        "Nautilus": {
            "title": "诺提勒斯",
            "id": 111,
            "key": "Nautilus",
            "name": "深海泰坦"
        },
        "Evelynn": {
            "title": "伊芙琳",
            "id": 28,
            "key": "Evelynn",
            "name": "寡妇制造者"
        },
        "Gragas": {
            "title": "古拉加斯",
            "id": 79,
            "key": "Gragas",
            "name": "酒桶"
        },
        "Zed": {
            "title": "劫",
            "id": 238,
            "key": "Zed",
            "name": "影流之主"
        },
        "Vi": {
            "title": "蔚",
            "id": 254,
            "key": "Vi",
            "name": "皮城执法官"
        },
        "KogMaw": {
            "title": "克格莫",
            "id": 96,
            "key": "KogMaw",
            "name": "深渊巨口"
        },
        "Ahri": {
            "title": "阿狸",
            "id": 103,
            "key": "Ahri",
            "name": "九尾妖狐"
        },
        "Quinn": {
            "title": "奎因",
            "id": 133,
            "key": "Quinn",
            "name": "德玛西亚之翼"
        },
        "Leblanc": {
            "title": "乐芙兰",
            "id": 7,
            "key": "Leblanc",
            "name": "诡术妖姬"
        },
        "Ezreal": {
            "title": "伊泽瑞尔",
            "id": 81,
            "key": "Ezreal",
            "name": "探险家"
        }
    }
}

exports.getChampionChineseNameById = function(championId){
    var key =  champions['keys'][championId];
    return champions['data'][key]['name'];
}

exports.getChampionEnglishNameById = function(championId){
    return (champions.keys)[championId];
}
