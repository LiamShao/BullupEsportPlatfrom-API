var dependencyUtil = require("../util/dependency_util.js");
dependencyUtil.init(__dirname.toString().substr(0, __dirname.length - "/service".length).replace(/\\/g, "/"));
var logUtil = dependencyUtil.global.utils.logUtil;

exports.handleLoginResult = function (feedback) {
    logUtil.methodLog('handleLoginResult');
    if (feedback.errorCode == 0) {
        // 代表登陆成功
        return feedback.extension;
    } else {
        logUtil.levelMsgLog(1, feedback.text);
        return null;
    }
}


exports.handleRegisterResult = function (feedback) {
    logUtil.methodLog('handleRegisterResult');
    if (feedback.errorCode == 0) {
        return feedback.extension;
    } else {
        logUtil.levelMsgLog(1, feedback.text);
        return null;
    }
}

exports.handleTeamEstablishResult = function (feedback) {
    logUtil.methodLog('handleTeamEstablishResult');
    if (feedback.errorCode == 0) {
        //TODO 展示在页面上
        logUtil.levelMsgLog(1, feedback.text);
        return feedback.extension;
    } else {
        logUtil.levelMsgLog(1, feedback.text);

    }
}

exports.handleInvitation = function (feedback) {
    logUtil.methodLog('handleInvitation');

    if (feedback.errorCode == 0) {
        logUtil.levelMsgLog(1, feedback.text);
    }
    switch (feedback.errorCode) {
        case 1: // 服务器问题导致用户邀请失败
            logUtil.levelMsgLog(1, feedback.text);
            //TODO Do something
            break;

        case 2: // 受邀用户拒绝邀请
            logUtil.levelMsgLog(1, feedback.text);
            //TODO Do something
            break;
    }

}

exports.handleVersusLobbyInfo = function (feedback) {
    logUtil.methodLog('handleVersusLobbyInfo');

    if (feedback.errorCode == 0) {
        logUtil.levelMsgLog(1, feedback.text);
        return feedback.extension;
    } else {
        // TODO 处理失败逻辑
    }
}

exports.handleTeamDetails = function (feedback) {
    logUtil.methodLog('handleTeamDetails');

    if (feedback.errorCode == 0) {
        logUtil.levelMsgLog(1, feedback.text);
        return feedback.extension;
    } else {
        logUtil.levelMsgLog(1, feedback.text);
    }
}
