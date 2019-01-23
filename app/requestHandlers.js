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
    let codigo = querystring.parse(postData)["txtCode0"];   
    let ast = compilador.compilar(codigo); 
    response.writeHead(200, {"Content-Type": "application/json"});    
    response.write(JSON.stringify(ast));    
    //response.write("Tu enviaste: " + querystring.parse(postData)["txtCode0"]);
    response.end(); 
}

function generateIndex(response, postData) {    
    let tableName = querystring.parse(postData)["tableName"];
    let nameTableSingular = querystring.parse(postData)["tableSingularName"];
    let routePrefix = querystring.parse(postData)["routePrefix"];

    if (!routePrefix)
        routePrefix = "admin";
    
    //compilación del archivo fuente la migración    
    let codigo = querystring.parse(postData)["txtCode0"];
    let ast = compilador.compilar(codigo);

    if (!tableName)
        tableName = ast.up.table;

        if (!nameTableSingular){
            if (tableName.endsWith('ies'))
                nameTableSingular = ast.up.table.substring(0, ast.up.table.length - 3) + "y";
            else
                nameTableSingular = ast.up.table.substring(0, ast.up.table.length - 1);
        }

    //generación de index.blade.php
    let plantilla = fs.readFileSync('./laravel/views/index.blade.php', 'utf8');    
    
    plantilla = plantilla.replace(/%Table%/g, tableName);    
    plantilla = plantilla.replace(/%TableSingular%/g, nameTableSingular); 
    plantilla = plantilla.replace(/%RoutePrefix%/g, routePrefix); 

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
            else if (definition.coltype == "softdeletes"){
                filaHeaders += '<th>deleted_at</th>\n';
            }
        }
    });
    plantilla = plantilla.replace(/%ColumnHeaders%/g, filaHeaders);   
    
    // datos
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
                case "timestamps":
                    fila += '<td>$' + nameTableSingular + '->created_at <td>\n' + '<td>$' + nameTableSingular + '->updated_at <td>\n';           
                  break;
                case "softdeletes":
                    fila += '<td>$' + nameTableSingular + '->deleted_at <td>\n';              
                  break;
                case "boolean":
                    fila += "@if ($" + nameTableSingular + '->' + definition.name + ")\n"
                    fila += "   <td>" + '<input id="%FieldName%" type="checkbox" class="form-control" name="%FieldName%" value="{{ old(\'%FieldName%\') }}">\n'  +"</td>\n"
                    fila += "@else\n"
                    fila += "   <td>" + '<input id="%FieldName%" type="checkbox" checked class="form-control" name="%FieldName%" value="{{ old(\'%FieldName%\') }}">\n'  +"</td>\n"
                    fila += "@endif\n"
                    fila = fila.replace(/%FieldName%/g, definition.name);
                    break;
                default:
                    fila += '<td>$'+ nameTableSingular + '->' + definition.name + '<td>\n';              
              }
        }        
    });
    plantilla = plantilla.replace(/%Fields%/g, fila);   

    //Creación del archivo
    if (!fs.existsSync('./genfiles')){
        fs.mkdirSync('./genfiles');
    }
    var filePath =  "./genfiles/index.blade.php";

    fs.writeFileSync(filePath, plantilla, 'utf8');    

    //envío al cliente
    response.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition" : "attachment; filename=index.blade.php"
    });
    fs.createReadStream(filePath).pipe(response);
}

function generateCreate(response, postData) {    
    let tableName = querystring.parse(postData)["tableName"];
    let nameTableSingular = querystring.parse(postData)["tableSingularName"];
    let routePrefix = querystring.parse(postData)["routePrefix"];

    if (!routePrefix)
        routePrefix = "admin";
    //compilación del archivo fuente la migración    
    let codigo = querystring.parse(postData)["txtCode0"];
    let ast = compilador.compilar(codigo);

    if (!tableName)
        tableName = ast.up.table;

    if (!nameTableSingular){
        if (tableName.endsWith('ies'))
            nameTableSingular = ast.up.table.substring(0, ast.up.table.length - 3) + "y";
        else
            nameTableSingular = ast.up.table.substring(0, ast.up.table.length - 1);
    }


    //generación de index.blade.php
    let plantilla = fs.readFileSync('./laravel/views/create.blade.php', 'utf8');    
    
    plantilla = plantilla.replace(/%Table%/g, tableName);    
    plantilla = plantilla.replace(/%TableSingular%/g, nameTableSingular); 
    plantilla = plantilla.replace(/%RoutePrefix%/g, routePrefix); 

    //campos del formulario
    let form = '';
    ast.up.definitions.forEach(function(definition, i, arr){
        let inputType = "text";
        let isForeignKey = false;

        if (definition.name && definition.coltype != "increments"){
            let fieldName = definition.name;

            form += '<div class="form-group{{ $errors->has(\'%FieldName%\') ? \' has-error\' : \'\' }}">\n'                         
            form += '       <label for="%FieldName%" class="col-md-4 control-label">%FieldName%</label>\n'
            form += '       <div class="col-md-6">\n'

            switch (definition.coltype){
                case "integer":
                    if (definition.name.endsWith('_id'))
                        isForeignKey = true;
                case "float":
                case "decimal":
                    inputType = "number";
                    break;
                case "string":
                case "smallText":
                case "mediumText":
                    inputType = "text";
                    break;
                case "date":
                    inputType = "date";
                    break;
                case "datetime":
                case "timestamp":
                    inputType = "datetime-local";
                    break;
                case "boolean":
                    inputType = "checkbox";
                    break;
            }
            
            if (isForeignKey){
                let pluralFieldName = "";

                if (definition.name.endsWith('y_id'))
                    pluralFieldName = fieldName.substring(0, fieldName.length - 4) + 'ies';
                else if (definition.name.endsWith('_id'))
                    pluralFieldName = fieldName.substring(0, fieldName.length - 3) + 's';                

                form += "           {{ Form::select('%FieldName%', $%PluralFieldName% , $%FieldName%, ['class' => 'form-control']) }}\n"
                form = form.replace(/%PluralFieldName%/g, pluralFieldName);       
            }else{
                form += '           <input id="%FieldName%" type="'+ inputType +'" class="form-control" name="%FieldName%" value="{{ old(\'%FieldName%\') }}">\n'                
            }
            
            form += '           @if ($errors->has("%FieldName%"))\n'
            form += '               <span class="help-block">\n'
            form += '                   <strong>{{ $errors->first("%FieldName%") }}</strong>\n'
            form += '                </span>\n'
            form += '           @endif\n'
            form += '      </div>\n'
            form += '</div>\n'

            form = form.replace(/%FieldName%/g, fieldName);            
        }        

    });
    plantilla = plantilla.replace(/%Inputs%/g, form);


    //generación del archivo     
    if (!fs.existsSync('./genfiles')){
        fs.mkdirSync('./genfiles');
    }
    var filePath =  "./genfiles/create.blade.php";
    fs.writeFileSync(filePath, plantilla, 'utf8');    

    //Envío del archivo al cliente
    response.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition" : "attachment; filename=create.blade.php"
    });
    fs.createReadStream(filePath).pipe(response);
}

function generateEdit(response, postData) {    
    let tableName = querystring.parse(postData)["tableName"];
    let nameTableSingular = querystring.parse(postData)["tableSingularName"];
    let routePrefix = querystring.parse(postData)["routePrefix"];

    if (!routePrefix)
        routePrefix = "admin";
    
    //compilación del archivo fuente la migración    
    let codigo = querystring.parse(postData)["txtCode0"];
    let ast = compilador.compilar(codigo);

    if (!tableName)
        tableName = ast.up.table;

    if (!nameTableSingular){
        if (tableName.endsWith('ies'))
            nameTableSingular = ast.up.table.substring(0, ast.up.table.length - 3) + "y";
        else
            nameTableSingular = ast.up.table.substring(0, ast.up.table.length - 1);
    }


    //generación de index.blade.php
    let plantilla = fs.readFileSync('./laravel/views/edit.blade.php', 'utf8');    
    
    plantilla = plantilla.replace(/%Table%/g, tableName);    
    plantilla = plantilla.replace(/%TableSingular%/g, nameTableSingular); 
    plantilla = plantilla.replace(/%RoutePrefix%/g, routePrefix); 

    //campos del formulario
    let form = '';
    ast.up.definitions.forEach(function(definition, i, arr){
        let inputType = "text";
        let isForeignKey = false;

        if (definition.name && definition.coltype != "increments"){
            let fieldName = definition.name;
            
            form += '<div class="form-group{{ $errors->has(\'%FieldName%\') ? \' has-error\' : \'\' }}">\n'                         
            form += '       <label for="%FieldName%" class="col-md-4 control-label">%FieldName%</label>\n'
            form += '       <div class="col-md-6">\n'

            switch (definition.coltype){
                case "integer":
                    if (definition.name.endsWith('_id'))
                        isForeignKey = true;
                case "float":
                case "decimal":
                    inputType = "number";
                    break;
                case "string":
                case "smallText":
                case "mediumText":
                    inputType = "text";
                    break;
                case "date":
                    inputType = "date";
                    break;
                case "datetime":
                case "timestamp":
                    inputType = "datetime-local";
                    break;
                case "boolean":
                    inputType = "checkbox";
                    break;
            }

            if (isForeignKey){
                let pluralFieldName = "";

                if (definition.name.endsWith('y_id'))
                    pluralFieldName = fieldName.substring(0, fieldName.length - 4) + 'ies';
                else if (definition.name.endsWith('_id'))
                    pluralFieldName = fieldName.substring(0, fieldName.length - 3) + 's';                

                form += "           @if (null !== (old('%FieldName%')))\n"
                form += "               {{ Form::select('%FieldName%', $%PluralFieldName% , old('%FieldName%'), ['class' => 'form-control']) }}\n"
                form += "           @else\n"
                form += "               {{ Form::select('%FieldName%', $%PluralFieldName% , $"+ nameTableSingular + "->%FieldName% , ['class' => 'form-control']) }}\n"
                form += "           @endif\n"

                form = form.replace(/%PluralFieldName%/g, pluralFieldName);       
            }else{
                form += "           @if (null !== (old('%FieldName%')))\n"
                form += '               <input id="%FieldName%" type="'+ inputType +'" class="form-control" name="%FieldName%" value="{{ old(\'%FieldName%\') }}">\n'                
                form += "           @else\n"
                form += '               <input id="%FieldName%" type="'+ inputType +'" class="form-control" name="%FieldName%" value="{{ $' + nameTableSingular + '->%FieldName%) }}">\n'                
                form += "           @endif\n"
            }
            
            form += '           @if ($errors->has("%FieldName%"))\n'
            form += '               <span class="help-block">\n'
            form += '                   <strong>{{ $errors->first("%FieldName%") }}</strong>\n'
            form += '                </span>\n'
            form += '           @endif\n'
            form += '      </div>\n'
            form += '</div>\n'

            form = form.replace(/%FieldName%/g, fieldName);                 
        }        

    });
    plantilla = plantilla.replace(/%Inputs%/g, form);


    //generación del archivo     
    if (!fs.existsSync('./genfiles')){
        fs.mkdirSync('./genfiles');
    }
    var filePath =  "./genfiles/edit.blade.php";
    fs.writeFileSync(filePath, plantilla, 'utf8');    

    //Envío del archivo al cliente
    response.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition" : "attachment; filename=edit.blade.php"
    });
    fs.createReadStream(filePath).pipe(response);
}

function generateController(response, postData) {    
    let tableName = querystring.parse(postData)["tableName"];
    let nameTableSingular = querystring.parse(postData)["tableSingularName"];
    let routePrefix = querystring.parse(postData)["routePrefix"];

    if (!routePrefix)
        routePrefix = "admin";
    
    //compilación del archivo fuente la migración    
    let codigo = querystring.parse(postData)["txtCode0"];
    let ast = compilador.compilar(codigo);

    if (!tableName)
        tableName = ast.up.table;

    if (!nameTableSingular){
        if (tableName.endsWith('ies'))
            nameTableSingular = ast.up.table.substring(0, ast.up.table.length - 3) + "y";
        else
            nameTableSingular = ast.up.table.substring(0, ast.up.table.length - 1);
    }

    let modelName = nameTableSingular.charAt(0).toUpperCase() + nameTableSingular.slice(1);
    let modelPluralName = tableName.charAt(0).toUpperCase() + tableName.slice(1);

    //generación de Controller
    let plantilla = fs.readFileSync('./laravel/controllers/CrudController.php', 'utf8');    
    
    //Validation Rules and field asignations
    let rules = '';
    let asig = '';

    ast.up.definitions.forEach(function(definition, i, arr){
        
        if (definition.name && definition.coltype != "increments"){
            let fieldName = definition.name;
            asig += '$%TableSingularName%->' + fieldName + " = $request->input('" + fieldName + "');\n" 
        }
        /*
        if (definition.name && definition.coltype != "increments"){
            let fieldName = definition.name;
            if (definition.details.length){
                rules += fieldName + "=> '"
                definition.details.forEach(function(detail){

                });
                rules += "',"
            }     
            */   

    });
    plantilla = plantilla.replace(/%FieldsAsignation%/g, asig);
    plantilla = plantilla.replace(/%ValidationRules%/g, rules);
    plantilla = plantilla.replace(/%Table%/g, tableName);    
    plantilla = plantilla.replace(/%TableSingularName%/g, nameTableSingular);
    plantilla = plantilla.replace(/%ModelName%/g, modelName);
    plantilla = plantilla.replace(/%ModelPluralName%/g, modelPluralName); 
    plantilla = plantilla.replace(/%RoutePrefix%/g, routePrefix); 
    

    //generación del archivo     
    if (!fs.existsSync('./genfiles')){
        fs.mkdirSync('./genfiles');
    }
    var filePath =  "./genfiles/" + modelPluralName + "Controller.php";
    fs.writeFileSync(filePath, plantilla, 'utf8');    

    //Envío del archivo al cliente
    response.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition" : "attachment; filename=" + modelPluralName + "Controller.php"
    });
    fs.createReadStream(filePath).pipe(response);
}

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
exports.generateCreate = generateCreate;
exports.generateEdit = generateEdit;
exports.generateController = generateController;