var servidor = require("./server.js");
var router = require("./router.js");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/"] = requestHandlers.index;
handle["/index"] = requestHandlers.index;
handle["/subir"] = requestHandlers.subir;
handle["/compilar"] = requestHandlers.compilar;
handle["/generateIndex"] = requestHandlers.generateIndex;
handle["/generateCreate"] = requestHandlers.generateCreate;

servidor.iniciar(router.route, handle);
