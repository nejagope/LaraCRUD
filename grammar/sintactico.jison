%{
    var nid = 0;
    function addChildren(node, child){
      node.splice(2,1,child); 
      return node;
    }
%}
%locations

%left accesor

%start MIGRATION

%%

MIGRATION : php USES CLASS eof {{ return $3 }};

USES : USES USE | USE;

USE : use PATH ptoComa;

PATH : PATH barra id
    | id;

CLASS : clase id extends id llaveA UP DOWN llaveC
    {{ $$ = {type: 'migration', up: $6,  down : $7 } }}
;

UP : publico funcion up parenA parenC llaveA id static_accesor create parenA CADENA coma funcion parenA id table parenC llaveA DEFS llaveC parenC ptoComa llaveC
        {{ $$ = {type: 'up', table: $11,  definitions : $19.children } }}
;

DOWN : publico funcion down parenA parenC llaveA id static_accesor dropifexists parenA CADENA parenC ptoComa llaveC
        {{ $$ = {type: 'down', table: $11} }}
;

DEFS : DEFS DEF 
        {{ var arr = $1.children; var arr2 = arr.concat($2); $1.children = arr2; $$ = $1;  }}
    | DEF {{  $$ = { type: 'definitions', children: [$1] } }}
    ;

DEF : table accesor COLTYPE parenA EXPS parenC MODIFIERS ptoComa
        {{ $$ = { coltype: $3.val, name: $5.children.shift(), details: $5.children, modifiers : $7.children } }}
    | table accesor COLTYPE parenA EXPS parenC ptoComa
        {{ $$ = { coltype: $3.val, name: $5.children.shift(), details: $5.children } }}
    | table accesor COLTYPE parenA parenC ptoComa
        {{ $$ = { coltype: $3.val  } }}
    ;

COLTYPE : increments
            {{$$ = {type: 'coltype', val: 'increments' } }}
        | cadena
            {{$$ = {type: 'coltype', val: 'string' } }}
        | entero
            {{$$ = {type: 'coltype', val: 'integer' } }}
        | booleano
            {{$$ = {type: 'coltype', val: 'boolean' } }}
        | datetime
            {{$$ = {type: 'coltype', val: 'datetime' } }}
        | timestamp
            {{$$ = {type: 'coltype', val: 'timestamp' } }}
        | float
            {{$$ = {type: 'coltype', val: 'float' } }}
        | decimal
            {{$$ = {type: 'coltype', val: 'decimal' } }}
        | timestamps
            {{$$ = {type: 'coltype', val: 'timestamps' } }}
        | remembertoken
            {{$$ = {type: 'coltype', val: 'remembertoken' } }}
        ;

MODIFIERS : MODIFIERS MODIFIER
                {{ var arr = $1.children; var arr2 = arr.concat($2); $1.children = arr2; $$ = $1;  }}
        | MODIFIER 
            {{  $$ = { type: 'modifiers', children: [$1] } }}
        ;

MODIFIER : accesor nullable parenA parenC
                {{$$ = { type: 'nullable' } }}
            | accesor unsigned  parenA parenC
                {{$$ = { type: 'unsigned' } }}
            | accesor unique parenA parenC
                {{$$ = { type: 'unique' } }}
            | accesor default parenA E parenC
                {{$$ = { type: 'default', val: $4 } }}
            ;

EXPS : EXPS coma E 
            {{ var arr = $1.children; var arr2 = arr.concat($3); $1.children = arr2; $$ = $1;  }}
    | E {{  $$ = { type: 'expressions', children: [$1] } }}
    ; 

E : booleanoLit   {{ $$ = yytext.toLowerCase() == 'true' }}
    | enteroLit     {{ $$ = parseInt(yytext) }}
    | decimalLit    {{ $$ = parseFloat(yytext) }}
    | CADENA     {{ $$ = $1 }}    
    ;


CADENA : cadenaLit {{$$ = yytext }};