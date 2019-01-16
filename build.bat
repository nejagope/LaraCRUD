cd app
del parser.js
cd ..
cd grammar
jison sintactico.jison lexico.jisonlex -o "..\app\parser.js"

