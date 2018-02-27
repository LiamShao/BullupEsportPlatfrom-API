var nodemailer = require('nodemailer')
 var  smtpTransport = nodemailer.createTransport({
    host: "smtp.163.com",
    port: 465,
    auth: {
        user: "13361014944@163.com",//用来发邮件的邮箱账户
        pass: "lf18306490044"//发件账户的密码
        }
});


var mailOptions= {
        from: "13361014944@163.com",
        to: "13361014944@163.com,13571331717@126.com,lingyuanping@outlook.com,18811624174@163.com,yujiaxin1117@163.com,Cao_xijiang@163.com",
        subject:  "斗牛服务器报错", //标题
        html:"服务器报错，请及时查看",
        attachments:[  
            {  
              filename : 'errors.txt',  
              path: './logs/error/errors.txt'  
            }
          ]  
}

smtpTransport.sendMail(mailOptions,function(err,response){
    if(err) console.log(err)
    else console.log(response);
})

