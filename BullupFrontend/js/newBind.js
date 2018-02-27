//判断用户是否绑定  
  $(document).on("click","#aaa",function(event){

      if(userInfo.lolAccountInfo != undefined || userInfo.lolAccountInfo != null){
            $('#inputLoLAccount').hide();
            $('#bind_lol_btn').hide();
            $('#bbb').hide();
            $('#rebind_lol_btn').show();
            $('#manIcon').hide();
            $('#userLoL').show().text('您目前绑定的账号是: '+userInfo.lolAccountInfo.user_lol_nickname);
            //alert(JSON.stringify(userInfo.lolAccountInfo));
      }else{
            $('#inputLoLAccount').show();
            $('#bind_lol_btn').show();
            $('#rebind_lol_btn').hide();
      }
  });

  $('#rebind_lol_btn').on('click',function(e){
    $('#inputLoLAccount').show();
    $('#bind_lol_btn').show();
    $('#bbb').show();
    $('#rebind_lol_btn').hide();
    $('#manIcon').show();
    $('#userLoL').hide()
  });