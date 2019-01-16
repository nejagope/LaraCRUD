%options case-insensitive

%x ML_COMMENT
%x STRING
%x STRING2

%%


// ----------------------------------- comentario multilinea -------------------------------------

"/*"                        this.pushState('ML_COMMENT');
<ML_COMMENT>"*/"            this.popState();
<ML_COMMENT>(.|\s)          /* Se ignora */
<ML_COMMENT>\n              /* Se ignora */
<ML_COMMENT><<EOF>>         throw "Final inesperado de archivo (comentario no cerrado)";

// --------------------------------- fin comentario multilinea -----------------------------------

// ----------------------------------- strings comillas dobles -------------------------------------

\"                      { this.pushState('STRING'); limpiarString(); }
<STRING>\"            	{ 
							this.popState(); 
							yytext=getString(); 
							return 'cadenaLit'; 
						}
/* <STRING>(\n|\r)      { appendString(yytext); yytext=getString(); return 'errorLex'; }	*/
<STRING>(\n|\r)         { appendString(yytext); }
<STRING>[^"\r\n]        { appendString(yytext); }
<STRING><<EOF>>         { appendString(yytext); yytext=getString(); return 'errorLex'; }

// --------------------------------- fin string comillas dobles -----------------------------------


// ----------------------------------- strings comillas simples-------------------------------------

\'                      { this.pushState('STRING2'); limpiarString(); }
<STRING2>\'            	{ 
							this.popState(); 
							yytext=getString(); 
							return 'cadenaLit'; 
						}
/* <STRING2>(\n|\r)      { appendString(yytext); yytext=getString(); return 'errorLex'; }	*/
<STRING2>(\n|\r)         { appendString(yytext); }
<STRING2>[^\'\r\n]        { appendString(yytext); }
<STRING2><<EOF>>         { appendString(yytext); yytext=getString(); return 'errorLex'; }

// --------------------------------- fin string comillas simples-----------------------------------

"//"(.|<<EOF>>)*                   /* ignorar comentario de línea */

\s+                         /* skip whitespace */
[0-9]+("."[0-9]+)\b         return 'decimalLit'
[0-9]+                      return 'enteroLit'

/*-------------------------------------------- PALABRAS RESERVADAS ----------------------------------*/

"true"               return 'booleanoLit'
"false"                   return 'booleanoLit'

"boolean"	             	return 'booleano'
"integer"					        return 'entero'
"float"					        return 'float'
"string"					      return 'cadena'
"datetime"					        return 'datetime'
"decimal"					        return 'decimal'

"<?php"						          return 'php'
"use"			return 'use'


"public"                 return 'publico'

"class"                   return 'clase'
"extends"               return 'extends'
"function"               return 'funcion'
"$table"                   return 'table'
"up"					return 'up'
"down"					return 'down'
"create"				return 'create'
"dropifexists"			return 'dropifexists'
"increments"			return 'increments'
"timestamp"				return 'timestamp'
"timestamps"				return 'timestamps'
"remembertoken"			return 'remembertoken'
"nullable"				return 'nullable'
"unsigned"				return 'unsigned'
"unique"				return 'unique'
"default"				return 'default'
"foreign"				return 'foreign'
"dropforeign"				return 'dropforeign'
"references" return 'references'
"on" return 'on'

/*-------------------------------------------- FIN PALABRAS RESERVADAS ------------------------------*/

[a-zA-Z_][a-zA-Z0-9_]*        return 'id'

"->"                         return 'accesor'
"::"                         return 'static_accesor'
"\\"				    return 'barra'

"{"                         return 'llaveA'
"}"                         return 'llaveC'
"("                         return 'parenA'
")"                         return 'parenC'
"["                         return 'corcheteA'
"]"                         return 'corcheteC'

","                         return 'coma'
";"                         return 'ptoComa'

.+\s                        return 'errorLex'
.+<<EOF>>                   return 'errorLex'
<<EOF>>                     return 'eof'


%%

var string = "";
function limpiarString(){
  string="";
}
function appendString(char){
  string = string + char;
}
function getString(){
  return string;
}
