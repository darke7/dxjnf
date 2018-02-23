let express = require('express');
let app = express();
let fortune = require('./lib/fortune');

//设置handlebars模板引擎
let handlebars = require('express3-handlebars').create({defaultLayout:'main'});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

//设置端口
app.set('port',process.env.PORT||3000);


//路由
//静态资源中间件
app.use(express.static(__dirname+'/public'));

//首页
app.get(['','/home','/home.html'],(req,res)=>{
	res.render('home');
});
//关于页
app.get(['/about','/about.html'],(req,res)=>{
	res.render('about',{fortune:fortune()});
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