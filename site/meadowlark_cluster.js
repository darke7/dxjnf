let cluster = require('cluster');

let startWorker = ()=>{
	let worker = cluster.fork();
	console.log(`CLUSTER: Worker ${worker.id} started`);
}

if(cluster.isMaster){
	require('os').cpus().forEach(()=>{
		startWorker();
	});
	//记录所有断开的工作线程。如果工作线程断开了，它应该退出
	//因此我们可以等待exit事件然后繁衍一个新的工作线程来代替它
	cluster.on('disconnect',(worker)=>{
		console.log(`clusteb: Worker ${worker.id} disconnected from the cluster.`);
	});
	//当有工作线程死掉（退出）时，创建一个工作线程代替它
	cluster.on('exit',(worker,code,signal)=>{
		console.log(`clusteb: Worker ${worker.id} died with exit code ${code}(${signal})`);
		startWorker();
	});
}else{
	//在这个工作线程上启动我们的应用服务器，参见meadowlark.js
	require('./meadowlark')();
}



