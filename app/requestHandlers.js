var querystring = require("querystring");
var fs = require("fs");
var compilador = require("./analizador.js");

function index(response, postData) {    
    let data = fs.readFileSync('./html/index.htm', 'utf8');
    let plantilla = data.split("{%}");
    
    let html = plantilla[0] + plantilla[1] + plantilla[2]; 
    html = html.replace(/%ConsoleResults%/g, "");    
    html = html.replace(/%Code%/g, "");    
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

function generateLayout(response, postData) {       
    var filePath =  "./laravel/views/layouts/admin/main.blade.php";
    //envío al cliente
    response.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition" : "attachment; filename=main.blade.php"
    });
    fs.createReadStream(filePath).pipe(response);
}

function generateAdminIndex(response, postData) {       
    var filePath =  "./laravel/views/admin_index.blade.php";
    //envío al cliente
    response.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition" : "attachment; filename=admin_index.blade.php"
    });
    fs.createReadStream(filePath).pipe(response);
}

function generateRoutes(response, postData) {   
    let codigo = querystring.parse(postData)["txtCode0"]; 
    let tableName = querystring.parse(postData)["tableName"];
    let nameTableSingular = querystring.parse(postData)["tableSingularName"];
    let routePrefix = querystring.parse(postData)["routePrefix"];
    
    
    let ast = compilador.compilar(codigo);
    
    if (!routePrefix)
        routePrefix = "admin";
    
    let routePrefixCapitalized = routePrefix.charAt(0).toUpperCase() + routePrefix.slice(1);

    if (!tableName)
        tableName = ast.up.table;

    if (!nameTableSingular){
        if (tableName.endsWith('ies'))
            nameTableSingular = ast.up.table.substring(0, ast.up.table.length - 3) + "y";
        else
            nameTableSingular = ast.up.table.substring(0, ast.up.table.length - 1);
    }
    
    let modelName = "";
    let modelNameArray = nameTableSingular.split("_");
    modelNameArray.forEach(function(namePart){
        modelName += namePart.charAt(0).toUpperCase() + namePart.slice(1);
    });
    
    let modelPluralName = "";
    if (tableName.endsWith('ies'))
        modelPluralName = modelName.substring(0, modelName.length - 1) + "ies";
    else
        modelPluralName = modelName + "s";
        
    let routes = "Route::group(['prefix' => '"+ routePrefix +"'], function(){\n";
    routes += "  Route::group(['prefix' => '"+ tableName +"'], function(){\n";
    routes += "         Route::get('/create', '" + routePrefix + "\\" + routePrefixCapitalized + modelPluralName + "Controller@create')->name('" + routePrefix + "_" + tableName + "_create');\n";
    routes += "         Route::post('/store', '" + routePrefix + "\\" + routePrefixCapitalized + modelPluralName + "Controller@store')->name('" + routePrefix + "_" + tableName + "_store');\n";
    routes += "         Route::get('/edit', '" + routePrefix + "\\" + routePrefixCapitalized + modelPluralName + "Controller@edit')->name('" + routePrefix + "_" + tableName + "_edit');\n";
    routes += "         Route::post('/update', '" + routePrefix + "\\" + routePrefixCapitalized + modelPluralName + "Controller@update')->name('" + routePrefix + "_" + tableName + "_update');\n";
    routes += "         Route::post('/delete', '" + routePrefix + "\\" + routePrefixCapitalized + modelPluralName + "Controller@delete')->name('" + routePrefix + "_" + tableName + "_delete');\n";
    routes += "         Route::post('/remove', '" + routePrefix + "\\" + routePrefixCapitalized + modelPluralName + "Controller@remove')->name('" + routePrefix + "_" + tableName + "_remove');\n";
    routes += "         Route::post('/restore', '" + routePrefix + "\\" + routePrefixCapitalized + modelPluralName + "Controller@restore')->name('" + routePrefix + "_" + tableName + "_restore');\n";
    routes += "         Route::get('/view', '" + routePrefix + "\\" + routePrefixCapitalized + modelPluralName + "Controller@view')->name('" + routePrefix + "_" + tableName + "_view');\n";
    routes += "         Route::post('/attach', '" + routePrefix + "\\" + routePrefixCapitalized + modelPluralName + "Controller@attach')->name('" + routePrefix + "_" + tableName + "_attach');\n";
    routes += "         Route::post('/detach', '" + routePrefix + "\\" + routePrefixCapitalized + modelPluralName + "Controller@detach')->name('" + routePrefix + "_" + tableName + "_detach');\n";
    routes += "         Route::get('/', '" + routePrefix + "\\" + routePrefixCapitalized + modelPluralName + "Controller@index')->name('" + routePrefix + "_" + tableName + "_index');\n";
    routes += "     });\n";
    routes += "});";
    let data = fs.readFileSync('./html/index.htm', 'utf8');
    let plantilla = data.split("{%}");
    
    let html = plantilla[0] + plantilla[1] + plantilla[2]; 
    html = html.replace(/%ConsoleResults%/g, routes);    
    html = html.replace(/%Code%/g, codigo);    
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(html);            
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
    let useSoftDeletes = "false";
    ast.up.definitions.forEach(function(definition, i, arr){
        
        if (definition.name && definition.name.endsWith('_id')){
            //llaves foráneas
            //fila += "<td>{{ Form::select('" + definition.name + "', $" + definition.name.substring(0, definition.name.length - 3) + "s , $" + definition.name + ", ['class' => 'form-control']) }}</td>\n"
            fila += '<td>{{$'+ nameTableSingular + '->' + definition.name + '}}\n';              
            fila += "   @if ($" + nameTableSingular + '->' + definition.name + ")\n"
            fila += "       ; {{$" + nameTableSingular + '->' + definition.name.substring(0, definition.name.length - 3) + "->name}}\n";
            fila += '   @endif\n';
            fila += ' </td>\n';
        }else{
            switch(definition.coltype) {            
                case "remembertoken":
                    fila += '<td>not_recovered</td>\n';              
                  break;
                case "timestamps":
                    fila += '<td>{{$' + nameTableSingular + '->created_at }}</td>\n' + '<td>{{$' + nameTableSingular + '->updated_at }}</td>\n';           
                  break;
                case "softdeletes":
                    fila += '<td>{{$' + nameTableSingular + '->deleted_at }}</td>\n';  
                    useSoftDeletes = "true";            
                  break;
                case "boolean":
                    fila += "@if ($" + nameTableSingular + '->' + definition.name + ")\n"
                    fila += "   <td>" + '<input id="%FieldName%" type="checkbox" class="form-control" name="%FieldName%" checked>\n'  +"</td>\n"
                    fila += "@else\n"
                    fila += "   <td>" + '<input id="%FieldName%" type="checkbox" class="form-control" name="%FieldName%"> }}">\n'  +"</td>\n"
                    fila += "@endif\n"
                    fila = fila.replace(/%FieldName%/g, definition.name);
                    break;
                default:
                    fila += '<td>{{$'+ nameTableSingular + '->' + definition.name + '}} </td>\n';              
              }
        }        
    });
    plantilla = plantilla.replace(/%Fields%/g, fila);
    plantilla = plantilla.replace(/%UseSoftDeletes%/g, useSoftDeletes);   

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

function generateView(response, postData) {    
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

    //generación de view.blade.php
    let plantilla = fs.readFileSync('./laravel/views/view.blade.php', 'utf8');    
    //let plantillaAsoc = fs.readFileSync('./laravel/views/components/association.blade.php', 'utf8');    
   
    // datos
    let filas = '', panelesAsociacion = '';
    let useSoftDeletes = "false";
    ast.up.definitions.forEach(function(definition, i, arr){
        let fila = '';
        //let panelAsoc = plantillaAsoc;

        if (definition.name && definition.name.endsWith('_id')){ 
            fila += '<tr>\n'           
            fila += '   <td><strong>' + definition.name + '</strong></td>\n';
            fila += '   <td>{{$'+ nameTableSingular + '->' + definition.name + '}}\n';              
            fila += "       @if ($" + nameTableSingular + '->' + definition.name + ")\n"
            fila += "           ; {{$" + nameTableSingular + '->' + definition.name.substring(0, definition.name.length - 3) + "->name}}\n";
            fila += '       @endif\n';
            fila += '   </td>\n';
            fila += '</tr>\n';

        }else{
            
            fila += '<tr>\n'   
            switch(definition.coltype) {                            
                case "remembertoken":
                    fila += '   <td><strong>remember_token</strong></td><td>not_recovered</td>\n';              
                  break;
                case "timestamps":
                    fila += '   <td><strong>created_at</strong></td>\n<td>{{$' + nameTableSingular + '->created_at }}</td></tr>\n' + '    <tr><td><strong>updated_at</strong></td>\n<td>{{$' + nameTableSingular + '->updated_at }}</td>';           
                  break;
                case "softdeletes":
                    fila += '   <td><strong>deleted_at</strong></td><td>{{$' + nameTableSingular + '->deleted_at }}</td>\n';  
                    useSoftDeletes = "true";            
                  break;
                case "boolean":
                    fila += '   <td><strong>' + definition.name + '</strong></td>\n';
                    fila += "@if ($" + nameTableSingular + '->' + definition.name + ")\n"
                    fila += "   <td>" + '<input id="%FieldName%" type="checkbox" class="form-control" name="%FieldName%" checked readonly>\n'  +"</td>\n"
                    fila += "@else\n"
                    fila += "   <td>" + '<input id="%FieldName%" type="checkbox" class="form-control" name="%FieldName%" readonly>\n'  +"</td>\n"
                    fila += "@endif\n"
                    fila = fila.replace(/%FieldName%/g, definition.name);
                    break;
                default:
                    fila += '   <td><strong>' + definition.name + '</strong></td>\n';
                    fila += '<td>{{$'+ nameTableSingular + '->' + definition.name + '}} </td>\n';              
              }
              fila += '</tr>\n'  
        }  
        filas += fila;      
    });
     
    plantilla = plantilla.replace(/%TableName%/g, tableName);    
    plantilla = plantilla.replace(/%TableSingularName%/g, nameTableSingular); 
    plantilla = plantilla.replace(/%RoutePrefix%/g, routePrefix);    
    plantilla = plantilla.replace(/%Fields%/g, filas);
    plantilla = plantilla.replace(/%UseSoftDeletes%/g, useSoftDeletes);   
    
    //Creación del archivo
    if (!fs.existsSync('./genfiles')){
        fs.mkdirSync('./genfiles');
    }
    var filePath =  "./genfiles/view.blade.php";

    fs.writeFileSync(filePath, plantilla, 'utf8');    

    //envío al cliente
    response.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition" : "attachment; filename=view.blade.php"
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

                //form += "           {{ Form::select('%FieldName%', $%PluralFieldName% , $%FieldName%, ['class' => 'form-control']) }}\n"
                form += '           <input id="%FieldName%" type="number" class="form-control" name="%FieldName%" value="{{ old(\'%FieldName%\') }}">\n'                
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
                    
                /*
                form += "           @if (null !== old('%FieldName%'))\n"
                form += "               {{ Form::select('%FieldName%', $%PluralFieldName% , old('%FieldName%'), ['class' => 'form-control']) }}\n"
                form += "           @else\n"
                form += "               {{ Form::select('%FieldName%', $%PluralFieldName% , $"+ nameTableSingular + "->%FieldName% , ['class' => 'form-control']) }}\n"
                form += "           @endif\n"


                form = form.replace(/%PluralFieldName%/g, pluralFieldName);       
                */
                form += "           @if (null !== old('%FieldName%'))\n"
                form += '               <input id="%FieldName%" type="number" class="form-control" name="%FieldName%" value="{{ old(\'%FieldName%\') }}">\n'                
                form += "           @else\n"
                form += '               <input id="%FieldName%" type="number" class="form-control" name="%FieldName%" value="{{ $' + nameTableSingular + '->%FieldName% }}">\n'                
                form += "           @endif\n"
            }else{
                form += "           @if (null !== old('%FieldName%'))\n"
                form += '               <input id="%FieldName%" type="'+ inputType +'" class="form-control" name="%FieldName%" value="{{ old(\'%FieldName%\') }}">\n'                
                form += "           @else\n"
                form += '               <input id="%FieldName%" type="'+ inputType +'" class="form-control" name="%FieldName%" value="{{ $' + nameTableSingular + '->%FieldName% }}">\n'                
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

    let modelName = "";
    let modelNameArray = nameTableSingular.split("_");
    modelNameArray.forEach(function(namePart){
        modelName += namePart.charAt(0).toUpperCase() + namePart.slice(1);
    });
    
    let modelPluralName = "";
    if (tableName.endsWith('ies'))
        modelPluralName = modelName.substring(0, modelName.length - 1) + "ies";
    else
        modelPluralName = modelName + "s";

    let routePrefixCapitalized = routePrefix.charAt(0).toUpperCase() + routePrefix.slice(1);

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
        
        if (definition.name && definition.coltype != "increments"){
            let fieldName = definition.name;
            let validationType = definition.coltype;
            if (validationType == "timestamp" || validationType == "datetime")
                validationType = "date";
            else if (validationType == "mediumText")
                validationType = "string";
            else if (validationType == "decimal")
                validationType = "numeric";
                
            rules += "'" + fieldName + "' => '" + validationType;

            if (fieldName.endsWith("_id")){
                //llave foránea
                let referencedTable = fieldName.substring(0, fieldName.length - 3);
                if (referencedTable.endsWith("y")){
                    referencedTable = referencedTable.substring(0, referencedTable.length - 1) + "ies";
                }else{
                    referencedTable += "s";
                }
                rules += "|exists:" + referencedTable + ",id";
            }
            if (definition.modifiers){
                
                definition.modifiers.forEach(function(modifier){
                    if (modifier.type == "unique")
                        rules += "|unique:" + tableName;
                    else if (modifier.type == "unsigned")
                        rules += "|min:0";
                    else if (modifier.type != "default")
                        rules +=  "|" + modifier.type;                                        
                });                
            }     

            if (definition.details.length){
                if (definition.coltype == "string")
                        rules +=  "|max:" + definition.details[0];                
            }     
            rules += "',\n";
        }   

    });
    plantilla = plantilla.replace(/%FieldsAsignation%/g, asig);
    plantilla = plantilla.replace(/%ValidationRules%/g, rules);
    plantilla = plantilla.replace(/%Table%/g, tableName);    
    plantilla = plantilla.replace(/%TableSingularName%/g, nameTableSingular);
    plantilla = plantilla.replace(/%ModelName%/g, modelName);
    plantilla = plantilla.replace(/%ModelPluralName%/g, modelPluralName); 
    plantilla = plantilla.replace(/%RoutePrefix%/g, routePrefix);
    plantilla = plantilla.replace(/%RoutePrefixCapitalized%/g, routePrefixCapitalized); 
    

    //generación del archivo     
    if (!fs.existsSync('./genfiles')){
        fs.mkdirSync('./genfiles');
    }
    var filePath =  "./genfiles/" + modelPluralName + "Controller.php";
    fs.writeFileSync(filePath, plantilla, 'utf8');    

    //Envío del archivo al cliente
    response.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition" : "attachment; filename=" + routePrefixCapitalized + modelPluralName + "Controller.php"
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
exports.generateView = generateView;
exports.generateController = generateController;
exports.generateRoutes = generateRoutes;
exports.generateLayout = generateLayout;
exports.generateAdminIndex = generateAdminIndex;