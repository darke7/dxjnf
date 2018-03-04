let express = require('express');
let app = express();
let fortune = require('./lib/fortune');
let formidable = require('formidable');
let fs = require('fs');
let jqupload = require('jquery-file-upload-middleware');
let credentials = require('./credentials');
let nodemailer = require('nodemailer');

/**
 * 发送邮件
 * @Author   Darke
 * @DateTime 2018-03-04
 * @param    {object}   mailOptions 邮件配置
 * @return   {[type]}               [description]
 */
let sendEmail = (mailOptions)=>{
	let mailTransport =  nodemailer.createTransport({
		service:'qq',
		auth:{
			user:credentials.email.user,
			pass:credentials.email.password
		}
	});

	let options = {
		from:`"xiyan" ${credentials.email.user}`,
		to:`3129335443@qq.com`,
		subject:'Your meadowlark Travel Tour',
		html:`<h1>123123123</h1><hr><p>pppppppppp</p>`,
		generateTextFromHtml:true
	}

	mailTransport.sendMail(mailOptions||options,(err,info)=>{
		if(err){
			console(err);
		}else{
			console.log(`Massage send: ${info.messageId}`);
			console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
		}
	});
}



//邮箱正则表达式
let VALID_EMAIL_REGEX = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;

//设置handlebars模板引擎
let handlebars = require('express3-handlebars').create({
	defaultLayout:'main',
	helpers:{
		section(name,options){	//模拟段落的辅助方法
			if(!this._sections){
				this._sections = {};
			}
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

//设置端口
app.set('port',process.env.PORT||3000);

//禁用包含服务器 类型或详细信息 的响应头 
app.disable('x-powered-by');
//是否开启视图缓存，一般开发模式下禁用，生产环境下启用
// app.set('view cache',true);


//解析post请求URL编码体的中间件
app.use(require('body-parser')());
//设置获取cookie中间件
app.use(require('cookie-parser')(credentials.cookieSecret));
//会话存储中间件
app.use(require('express-session')());

//天气组件的中间件
app.use((req,res,next)=>{
	if(!res.locals.partials){
		res.locals.partials = {};
	}
	res.locals.partials.weather = getWeatherData();
	next();
});

//开启测试模式
app.use((req,res,next)=>{
	res.locals.showTests = app.get('env') != 'production' && req.query.test === '1';
	next();
});


//静态资源中间件
app.use(express.static(__dirname+'/public'));

//jq文件上传路由
app.use('/upload',(req,res,next)=>{
	let now = Date.now();
	jqupload.fileHandler({
		uploadDir(){
			console.log(`${__dirname}/public/uploads/${now}`);
			return `${__dirname}/public/uploads/${now}`;
		},
		uploadUrl(){
			return `/uploads/ ${now}`;
		}
	})(req,res,next);
});
//如果有即显消息，把它上传到上下文并清除它
app.use((req,res,next)=>{
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});


//首页
app.get(['','/home','/home.html'],(req,res)=>{
	res.render('home');
});

//关于页
app.get(['/about','/about.html'],(req,res)=>{
	res.render('about',{
		fortune:fortune(),
		pageTestScript:'/qa/tests-about.js'
	});
});

//段落测试页
app.get(['/jquerytest','/jquerytest.html'],(req,res)=>{
	res.render('jquerytest');
});

//客户端模版页
app.get(['/nursery-rhyme','/nursery-rhyme.html'],(req,res)=>{
	res.render('nursery-rhyme');
});//客户端模版页json数据
app.get(['/data/nursery-rhyme','/data/nursery-rhyme.html'],(req,res)=>{
	res.json({
		animal:'squirrel',
		bodyPart:'tail',
		adjective:'bushy',
		noun:'heck'
	});
});

//提交表单
app.get(['/newsletter','/newsletter.html'],(req,res)=>{
	//CSRF会在后面添加，目前只提供一个虚拟值
	// res.render('newsletter',{csrf:'CSRF token goes here'});
	res.render('newsletter');
});


app.post(['/process','/process.html'],(req,res)=>{
	if(req.xhr || req.accepts('json,html') === 'json'){
		res.send({success:true});
	}else{
		res.redirect(303,'/thank-you');
	}
});
app.get(['/thank-you','/thank-you.html'],(req,res)=>{
	res.render('thank-you');
});

app.post('/process2',(req,res)=>{
	let name = req.body.name || '',email = req.body.email || '';
	console.log(email);
	//输入验证
	if(!email.match(VALID_EMAIL_REGEX)){
		if(req.xhr){
			return res.json({
				error:'Invalid name email address.'
			});
		}
		req.session.flash = {
			type:'danger',
			intro:'Validation error!',
			message:'The email address you entered was not valid.'
		};
		return res.redirect(303,'/newsletter/archive');
	}
	new NewletterSignup({name:name,email:email}).save((err)=>{
		if(err){
			if(req.xhr){
				res.json({
					error:'Database error.'
				});
			}
			req.session.flash = {
				type:'danger',
				intro:'Database',
				message:'There was a database error;please try again later.'
			}
			return res.redirect(303,'/newsletter/archive');
		}
		if(req.xhr){
			return res.json({success : true});
		}
		req.session.flash = {
			type:'success',
			intro:'thank you!',
			message:'You have now been signed up for the newsletter.'
		};
		return res.redirect(303,'/newsletter/archive');
	});	
});


//原始文件上传
app.get(['/contest/vacation-photo','/contest/vacation-photo.html'],(req,res)=>{
	let now = new Date();
	res.render('contest/vacation-photo',{
		year:now.getFullYear(),month:now.getMonth()
	});
});
app.post('/contest/vacation-photo/:year/:month',(req,res)=>{
	let form = new formidable.IncomingForm();
	form.parse(req,(err,fields,files)=>{
		if(err){
			return res.redirect(303,'/error');
		}
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		res.redirect(303,'/thank-you');
	})
});

//jq文件上传
app.get(['/uploadfile','/uploadfile.html'],(req,res)=>{
	res.render('uploadfile');
});

//thank you page
app.post('/cart/checkout',(req,res)=>{
	// let cart = req.session.cart;
	// // if(!cart){
	// // 	next(new Error('cart does not exist.'));
	// // }
	// let name = req.body.nam||'',email = req.body.email||'';
	// //输入验证
	// if(!email.match(VALID_EMAIL_REGEX)){
	// 	return res.next(new Error('invalid email address.'));
	// }
	// //分配一个随机的购物车id；一般我们会用一个数据库id
	// cart.number = Math.random().toString().replace(/^0\.0*/,'');
	// cart.billing = {
	// 	name:name,
	// 	email:email
	// };
	res.render('email/cart-thank-you',{layout:null,cart:{billing:{name:'jone',email:'123@hotmail.com'},number:999}},(err,html)=>{
		if(err){
			console.log('email template error!');
		}
		sendEmail({
			from:`"Meadowlark" ${credentials.email.user }`,
			to:`3129335443@qq.com`,
			subject:'thank you for book your trip width meadowlark',
			html:html,
			generateTextFromHtml:true
		});
	});
	res.render('cart-thank-you',{cart:{billing:{name:'jone',email:'123@hotmail.com'},number:999}});
});

//定制404页面
app.use((req,res)=>{
	res.status(404);
	res.render('404');
});

//定制500页面
app.use((err,req,res)=>{
	console.log(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'),()=>{
	console.log(`Express started on http://localhost:${app.get('port')}`);
});



let getWeatherData = ()=>{
	return {
		locations:[
			{
				name:'Portland',
				forecastUrl:'http://www.wunderground.com/US/OR/Portland.html',
				iconUrl:'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
				weather:'Overcast',
				temp:'54.1 F (12.3 C)'
			},
			{
				name:'Bend',
				forecastUrl:'http://www.wunderground.com/US/OR/Bend.html',
				iconUrl:'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
				weather:'Partly Cloudy',
				temp:'55.0 F (12.8 C)'
			},
			{
				name:'Manzanita',
				forecastUrl:'http://www.wunderground.com/US/OR/Manzanita.html',
				iconUrl:'http://icons-ak.wxug.com/i/c/k/rain.gif',
				weather:'Light Rain',
				temp:'55.0 F (12.8 C)'
			}
		]
	};
}