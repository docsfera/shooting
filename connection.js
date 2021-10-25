//import {scene} from "./main.js"
//const expf = require('expf.js')
// console.log('hooooooooooooo', expf)

var socket = io();
const loader = new ThreeBSP();
 camer22a = new THREE.PerspectiveCamera( 75, 300 / 200, 1, 1000 );
 console.log('goo', camer22a, loader)
socket.emit('chat message', 'gg')
socket.on('chat message', 'gg2')