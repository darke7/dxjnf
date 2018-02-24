//确保“关于”页面 上总是有一个指向“联系我们”页面的链接
suite('"About" Page Tests',()=>{
	test('page should contain link to contact page',()=>{
		assert($('a[href="/contact"]').length);
	});
});