let nodemailer = require('nodemailer');
module.exports = (credentials)=>{
	let mailTransport = nodemailer.createTransport({
		service:'qq',
		auth:{
			user:credentials.email.user,
			pass:credentials.email.password
		}
	});

	let from = `'Meadowlark' <${credentials.email.user}>`;
	let errRecipient = credentials.email.user;

	return {
		/**
		 * 发送邮件
		 * @param  {string} to   接收人邮箱
		 * @param  {string} subj 标题
		 * @param  {string} body 邮件内容
		 * @return {[type]}      [description]
		 */
		send(to,subj,body){
			mailTransport.sendMail({
				from,
				to,
				subject:subj,
				html:body,
				generateTextFromHtml:true
			},(err)=>{
				if(err){
					console.log(`unable to send email--err :${err}`);
				}
			});
		},
		emailError(massage,filename,exception){
			let body = `
				<h1>Meadowlark Travel Site Error</h1>massage<br>
				<pre>${massage}</pre><br>
			`;
			if(exception){
				body+=`exception:<br><pre>
					${exception}
				</pre><br>`;
			}
			if(filename){
				body+=`filename:<br><pre>
					${filename}
				</pre><br>`;
			}
			mailTransport.sendMail({
				from:from,
				to:errRecipient,
				subject:'Meadowlark Travel Site Error',
				html:body,
				generateTextFromHtml:true
			},(err)=>{
				if(err){
					console.log(`unable to send email--err:${err}`);
				}
			});
		}
	};
};