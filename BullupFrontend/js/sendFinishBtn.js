if(battleInfo.blueSide.captain.userId == userInfo.userId || battleInfo.redSide.captain.userId == userInfo.userId){
    $('#sendFlagBtn').css({'display': 'block'});
}