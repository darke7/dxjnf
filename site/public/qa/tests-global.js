//确保所有页面具有有效的标题
suite('Global Tests',()=>{
	test('page has valid title',()=>{
		assert(document.title && document.title.match(/\S/) && document.title.toUpperCase() !== 'TODO');
	});
});