let path = require('path');
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
		 * @param  {array} to   接收人邮箱数组
		 * @param  {string} subj 标题
		 * @param  {string} body 邮件内容
		 * @return {[type]}      [description]
		 */
		send(to,subj,body){
			mailTransport.sendMail({
				from,
				to:'0asdfasdf',
				subject:subj,
				html:body,
				generateTextFromHtml:true
			},(err)=>{
				if(err){
					console.log(`unable to send email--err :${err}`);
					let errArr = to;
					errArr.push(errRecipient)
					this.emailError(errArr,'这个发邮件的小工具崩溃了',path.parse(__filename).base);
				}
			});
		},
		/**
		 * 网站邮件功能监测工具
		 * @param  {array} errArr    错误通知接收人数组
		 * @param  {string} massage   错误信息
		 * @param  {string} filename  错误文件名
		 * @param  {string} exception 额外的信息
		 * @return {[type]}           [description]
		 */
		emailError(errArr,massage,filename,exception){
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
				to:errArr.join(','),
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