var querystring = require("querystring");
var fs = require("fs");
var compilador = require("./analizador.js");

function index(response, postData) {    
    let data = fs.readFileSync('./html/index.htm', 'utf8');
    let plantilla = data.split("{%}");
    //console.log(plantilla.length);
    //console.log(plantilla);
    /*
    for (var i = 0; i < 100; i++) {
        plantilla[0] += '<tr><td width="25%">' + i + '</td><td><p class="lineaEditor"> Un texto de prueba</p></td>';
        plantilla[1] += '<tr><td width="25%">' + i + '</td><td><p class="lineaEditor"> Un texto de C4D de prueba</p></td>';
    }
    */
    let html = plantilla[0] + plantilla[1] + plantilla[2]; 
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(html);            
    response.end();
    
}

function compilar(response, postData) {    
    let ast = compilador.compilar(codigo); 
    response.writeHead(200, {"Content-Type": "application/json"});    
    response.write(JSON.stringify(ast));    
    //response.write("Tu enviaste: " + querystring.parse(postData)["txtCode0"]);
    response.end(); 
}

function generateIndex(response, postData) {    
    //compilación del archivo fuente la migración
    let codigo = querystring.parse(postData)["txtCode0"];
    let ast = compilador.compilar(codigo);

    let nameTableSingular = ast.up.table.substring(0, ast.up.table.length - 1);

    //generación de index.blade.php
    let plantilla = fs.readFileSync('./laravel/views/index.blade.php', 'utf8');    
    console.log(ast.up.table);
    plantilla = plantilla.replace(/%Table%/g, ast.up.table);    
    plantilla = plantilla.replace(/%TableSingular%/g, nameTableSingular); 
    plantilla = plantilla.replace(/%RoutePrefix%/g, 'sge'); 

    //encabezados de columna
    let filaHeaders = '';
    ast.up.definitions.forEach(function(definition, i, arr){
        if (definition.name){
            filaHeaders += '<th>' + definition.name + '</th>\n';
        }else{
            if (definition.coltype == "timestamps"){
                filaHeaders += '<th>created_at</th>\n<th>updated_at</th>\n';
            }
            else if (definition.coltype == "remembertoken"){
                filaHeaders += '<th>remember_token</th>\n';
            }
        }
    });
    plantilla = plantilla.replace(/%ColumnHeaders%/g, filaHeaders);   
    
    //datos
    let fila = '';
    ast.up.definitions.forEach(function(definition, i, arr){
        
        if (definition.name && definition.name.endsWith('_id')){
            //llaves foráneas
            fila += "{{ Form::select('" + definition.name + "', $" + definition.name.substring(0, definition.name.length - 3) + "s , $" + definition.name + ", ['class' => 'form-control']) }}\n"
        }else{
            switch(definition.coltype) {            
                case "remembertoken":
                    fila += '<td>not_recovered<td>\n';              
                  break;
                default:
                    fila += '<td>$'+ nameTableSingular + '->' + definition.name + '<td>\n';              
              }
        }        
    });
    plantilla = plantilla.replace(/%Fields%/g, fila);   

    //Envío del archivo al cliente
    var filePath =  "./genfiles/index.blade.php";

    fs.writeFileSync(filePath, plantilla, 'utf8');    

    response.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition" : "attachment; filename=index.blade.php"
    });
    fs.createReadStream(filePath).pipe(response);
}
/*
function index(response, postData) {	
	console.log("Manipulador de petición 'iniciar' ha sido llamado.");
	var contenido = '<html>'+
    '<head>'+
    '<meta charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/subir" method="post">'+
    '<textarea id="areaTexto" name = "text" rows="20" cols="60"></textarea>'+
    '<input type="submit" value="Enviar texto" />'+
    '</form>'+
    '</body>'+
    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(contenido);
    response.end();
}
*/

function subir(response, postData) {
	console.log("Manipulador de petición 'subir' fue llamado.");
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("Tu enviaste: " + querystring.parse(postData)["text"]);
	response.end();	
}

exports.index = index;
exports.subir = subir;
exports.compilar = compilar;
exports.generateIndex = generateIndex;