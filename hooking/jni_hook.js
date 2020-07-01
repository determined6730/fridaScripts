var modules = Process.enumerateModulesSync()
var size = modules.length

var library = []
for ( var i = 0; i < size ; i ++ ){
	if ( modules[i].name.search("netsdk") != -1 ) 
	{
		console.log(modules[i].base)
		console.log(modules[i].name)
		console.log(modules[i].path)
		console.log(modules[i].size)
	}
		
}


