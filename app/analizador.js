var parser = require("./parser").parser;
var fs = require("fs");


function compilar(codigoAltoNivel){	
	try{
		var ast =  getAST(codigoAltoNivel);						
		return jsonToString(ast);
	}catch(ex){
		return ex;
	}
	//mostrarC4Ds(resCuadruplosProg);
}

exports.compilar = compilar;


function exec (input) {
    var res = parser.parse(input);
    console.log( JSON.stringify() );
}

function jsonToString(json){
  return JSON.stringify(json);
}

function getAST(codigoFuente){
	try{
		var res = parser.parse(codigoFuente);    
	    return res;	
	}catch(ex){
		console.log(ex);
		return [];
	}	
}

/** Obtiene el primer hijo del @tipo de un árbol ast*/
function getHijo(ast, tipo){
	var nodo = -1;
	ast.hijos.forEach (function(hijo){		
		if (hijo && hijo.tipo == tipo){			
			nodo = hijo;
			return -1; 
		}

	});
	return nodo;
}


/** Retorna todos los hijos del @tipo de un árbol ast*/
function getHijos(ast, tipo){
	var nodos = [];
	ast.hijos.forEach (function(hijo){		
		if (hijo && hijo.tipo == tipo){			
			nodos = nodos.concat(hijo);			
		}

	});
	return nodos;
}


