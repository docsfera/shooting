THREE.OBJLoader = function ( manager ) {

  this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.OBJLoader.prototype = {

  constructor: THREE.OBJLoader,

  load: function ( url, onLoad, onProgress, onError ) {

    var scope = this;

    var loader = new THREE.XHRLoader( scope.manager );
    loader.setCrossOrigin( this.crossOrigin );
    loader.load( url, function ( text ) {

      onLoad( scope.parse( text ) );

    }, onProgress, onError );

  },

  parse: function ( text ) {

    console.time( 'OBJLoader' );

    var object, objects = [];
    var geometry, material;

    function parseVertexIndex( value ) {

      var index = parseInt( value );

      return ( index >= 0 ? index - 1 : index + vertices.length / 3 ) * 3;

    }

    function parseNormalIndex( value ) {

      var index = parseInt( value );

      return ( index >= 0 ? index - 1 : index + normals.length / 3 ) * 3;

    }

    function parseUVIndex( value ) {

      var index = parseInt( value );

      return ( index >= 0 ? index - 1 : index + uvs.length / 2 ) * 2;

    }

    function addVertex( a, b, c ) {

      geometry.vertices.push(
        vertices[ a ], vertices[ a + 1 ], vertices[ a + 2 ],
        vertices[ b ], vertices[ b + 1 ], vertices[ b + 2 ],
        vertices[ c ], vertices[ c + 1 ], vertices[ c + 2 ]
      );

    }

    function addNormal( a, b, c ) {

      geometry.normals.push(
        normals[ a ], normals[ a + 1 ], normals[ a + 2 ],
        normals[ b ], normals[ b + 1 ], normals[ b + 2 ],
        normals[ c ], normals[ c + 1 ], normals[ c + 2 ]
      );

    }

    function addUV( a, b, c ) {

      geometry.uvs.push(
        uvs[ a ], uvs[ a + 1 ],
        uvs[ b ], uvs[ b + 1 ],
        uvs[ c ], uvs[ c + 1 ]
      );

    }

    function addFace( a, b, c, d,  ua, ub, uc, ud,  na, nb, nc, nd ) {

      var ia = parseVertexIndex( a );
      var ib = parseVertexIndex( b );
      var ic = parseVertexIndex( c );

      if ( d === undefined ) {

        addVertex( ia, ib, ic );

      } else {

        var id = parseVertexIndex( d );

        addVertex( ia, ib, id );
        addVertex( ib, ic, id );

      }

      if ( ua !== undefined ) {

        var ia = parseUVIndex( ua );
        var ib = parseUVIndex( ub );
        var ic = parseUVIndex( uc );

        if ( d === undefined ) {

          addUV( ia, ib, ic );

        } else {

          var id = parseUVIndex( ud );

          addUV( ia, ib, id );
          addUV( ib, ic, id );

        }

      }

      if ( na !== undefined ) {

        var ia = parseNormalIndex( na );
        var ib = parseNormalIndex( nb );
        var ic = parseNormalIndex( nc );

        if ( d === undefined ) {

          addNormal( ia, ib, ic );

        } else {

          var id = parseNormalIndex( nd );

          addNormal( ia, ib, id );
          addNormal( ib, ic, id );

        }

      }

    }

    // create mesh if no objects in text

    if ( /^o /gm.test( text ) === false ) {

      geometry = {
        vertices: [],
        normals: [],
        uvs: []
      };

      material = {
        name: ''
      };

      object = {
        name: '',
        geometry: geometry,
        material: material
      };

      objects.push( object );

    }

    var vertices = [];
    var normals = [];
    var uvs = [];

    // v float float float

    var vertex_pattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

    // vn float float float

    var normal_pattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

    // vt float float

    var uv_pattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

    // f vertex vertex vertex ...

    var face_pattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;

    // f vertex/uv vertex/uv vertex/uv ...

    var face_pattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;

    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

    var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;

    // f vertex//normal vertex//normal vertex//normal ... 

    var face_pattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/

    //

    var lines = text.split( '\n' );

    for ( var i = 0; i < lines.length; i ++ ) {

      var line = lines[ i ];
      line = line.trim();

      var result;

      if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

        continue;

      } else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {

        // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

        vertices.push(
          parseFloat( result[ 1 ] ),
          parseFloat( result[ 2 ] ),
          parseFloat( result[ 3 ] )
        );

      } else if ( ( result = normal_pattern.exec( line ) ) !== null ) {

        // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

        normals.push(
          parseFloat( result[ 1 ] ),
          parseFloat( result[ 2 ] ),
          parseFloat( result[ 3 ] )
        );

      } else if ( ( result = uv_pattern.exec( line ) ) !== null ) {

        // ["vt 0.1 0.2", "0.1", "0.2"]

        uvs.push(
          parseFloat( result[ 1 ] ),
          parseFloat( result[ 2 ] )
        );

      } else if ( ( result = face_pattern1.exec( line ) ) !== null ) {

        // ["f 1 2 3", "1", "2", "3", undefined]

        addFace(
          result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ]
        );

      } else if ( ( result = face_pattern2.exec( line ) ) !== null ) {

        // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
        
        addFace(
          result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ],
          result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ]
        );

      } else if ( ( result = face_pattern3.exec( line ) ) !== null ) {

        // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

        addFace(
          result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ],
          result[ 3 ], result[ 7 ], result[ 11 ], result[ 15 ],
          result[ 4 ], result[ 8 ], result[ 12 ], result[ 16 ]
        );

      } else if ( ( result = face_pattern4.exec( line ) ) !== null ) {

        // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

        addFace(
          result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ],
          undefined, undefined, undefined, undefined,
          result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ]
        );

      } else if ( /^o /.test( line ) ) {

        geometry = {
          vertices: [],
          normals: [],
          uvs: []
        };

        material = {
          name: ''
        };

        object = {
          name: line.substring( 2 ).trim(),
          geometry: geometry,
          material: material
        };

        objects.push( object )

      } else if ( /^g /.test( line ) ) {

        // group

      } else if ( /^usemtl /.test( line ) ) {

        // material

        material.name = line.substring( 7 ).trim();

      } else if ( /^mtllib /.test( line ) ) {

        // mtl file

      } else if ( /^s /.test( line ) ) {

        // smooth shading

      } else {

        // console.log( "THREE.OBJLoader: Unhandled line " + line );

      }

    }

    var container = new THREE.Object3D();

    for ( var i = 0, l = objects.length; i < l; i ++ ) {

      var object = objects[ i ];
      var geometry = object.geometry;

      var buffergeometry = new THREE.BufferGeometry();

      buffergeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( geometry.vertices ), 3 ) );

      if ( geometry.normals.length > 0 ) {
        buffergeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( geometry.normals ), 3 ) );
      }

      if ( geometry.uvs.length > 0 ) {
        buffergeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( geometry.uvs ), 2 ) );
      }

      var material = new THREE.MeshLambertMaterial();
      material.name = object.material.name;

      var mesh = new THREE.Mesh( buffergeometry, material );
      mesh.name = object.name;

      container.add( mesh );

    }

    console.timeEnd( 'OBJLoader' );

    return container;

  }

};



var PointerLockControls = function ( camera, domElement ) {

  if ( domElement === undefined ) {

    console.warn( 'THREE.PointerLockControls: The second parameter "domElement" is now mandatory.' );
    domElement = document.body;

  }

  this.domElement = domElement;
  this.isLocked = false;

  // Set to constrain the pitch of the camera
  // Range is 0 to Math.PI radians
  this.minPolarAngle = 0; // radians
  this.maxPolarAngle = Math.PI; // radians

  //
  // internals
  //

  var scope = this;

  var changeEvent = { type: 'change' };
  var lockEvent = { type: 'lock' };
  var unlockEvent = { type: 'unlock' };

  var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );

  var PI_2 = Math.PI / 2;

  var vec = new THREE.Vector3();

  function onMouseMove( event ) {

    if ( scope.isLocked === false ) return;

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    euler.setFromQuaternion( camera.quaternion );

    euler.y -= movementX * 0.002;
    euler.x -= movementY * 0.002;

    euler.x = Math.max( PI_2 - scope.maxPolarAngle, Math.min( PI_2 - scope.minPolarAngle, euler.x ) );

    camera.quaternion.setFromEuler( euler );

    scope.dispatchEvent( changeEvent );

  }

  function onPointerlockChange() {

    if ( scope.domElement.ownerDocument.pointerLockElement === scope.domElement ) {

      scope.dispatchEvent( lockEvent );

      scope.isLocked = true;

    } else {

      scope.dispatchEvent( unlockEvent );

      scope.isLocked = false;

    }

  }

  function onPointerlockError() {

    console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );

  }

  this.connect = function () {

    scope.domElement.ownerDocument.addEventListener( 'mousemove', onMouseMove, false );
    scope.domElement.ownerDocument.addEventListener( 'pointerlockchange', onPointerlockChange, false );
    scope.domElement.ownerDocument.addEventListener( 'pointerlockerror', onPointerlockError, false );

  };

  this.disconnect = function () {

    scope.domElement.ownerDocument.removeEventListener( 'mousemove', onMouseMove, false );
    scope.domElement.ownerDocument.removeEventListener( 'pointerlockchange', onPointerlockChange, false );
    scope.domElement.ownerDocument.removeEventListener( 'pointerlockerror', onPointerlockError, false );

  };

  this.dispose = function () {

    this.disconnect();

  };

  this.getObject = function () { // retaining this method for backward compatibility

    return camera;

  };

  this.getDirection = function () {

    var direction = new THREE.Vector3( 0, 0, - 1 );

    return function ( v ) {

      return v.copy( direction ).applyQuaternion( camera.quaternion );

    };

  }();

  this.moveForward = function ( distance ) {

    // move forward parallel to the xz-plane
    // assumes camera.up is y-up

    vec.setFromMatrixColumn( camera.matrix, 0 );

    vec.crossVectors( camera.up, vec );

    camera.position.addScaledVector( vec, distance );

  };

  this.moveRight = function ( distance ) {

    vec.setFromMatrixColumn( camera.matrix, 0 );

    camera.position.addScaledVector( vec, distance );

  };

  this.lock = function () {

    this.domElement.requestPointerLock();

  };


  this.unlock = function () {

    scope.domElement.ownerDocument.exitPointerLock();

  };

  this.connect();

};

PointerLockControls.prototype = Object.create( THREE.EventDispatcher.prototype );
PointerLockControls.prototype.constructor = PointerLockControls;

































//import * as THREE from './three/build/three.module.js';
//import {ThreeBSP} from './js/ThreeBSP.js';

      //import { PointerLockControls } from './three/examples/jsm/controls/PointerLockControls.js';
      ///import { OBJLoader } from './three/examples/jsm/loaders/OBJLoader.js';

      var socket = io();

      var guns = {}

      var camera, scene, renderer, controls;

      let isKlick = false
      let ggg;

      var objects = [];
      let bullets = [];

      var raycaster;

      var moveForward = false;
      var moveBackward = false;
      var moveLeft = false;
      var moveRight = false;
      var canJump = false;

      var prevTime = performance.now();
      var velocity = new THREE.Vector3();
      var direction = new THREE.Vector3();
      var vertex = new THREE.Vector3();
      var color = new THREE.Color();

      let gun;

      init();
      animate();

      function init() {

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
        camera.position.y = 10;

        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xffffff );
        scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

        var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
        light.position.set( 0.5, 1, 0.75 );
        scene.add( light );

        controls = new PointerLockControls( camera, document.body );

        var blocker = document.getElementById( 'blocker' );
        var instructions = document.getElementById( 'instructions' );

        instructions.addEventListener( 'click', function () {

          controls.lock();

        }, false );

        controls.addEventListener( 'lock', function () {

          instructions.style.display = 'none';
          blocker.style.display = 'none';

        } );

        controls.addEventListener( 'unlock', function () {

          blocker.style.display = 'block';
          instructions.style.display = '';

        } );

        scene.add( controls.getObject() );





        var onKeyDown = function ( event ) {

          switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
              moveForward = true;
              break;

            case 37: // left
            case 65: // a
              moveLeft = true;
              break;

            case 40: // down
            case 83: // s
              moveBackward = true;
              break;

            case 39: // right
            case 68: // d
              moveRight = true;
              break;

            case 32: // space
              if ( canJump === true ) velocity.y += 350;
              canJump = false;
              break;

          }

        };

        var onKeyUp = function ( event ) {

          switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
              moveForward = false;
              break;

            case 37: // left
            case 65: // a
              moveLeft = false;
              break;

            case 40: // down
            case 83: // s
              moveBackward = false;
              break;

            case 39: // right
            case 68: // d
              moveRight = false;
              break;

          }

        };


        document.addEventListener( 'keydown', onKeyDown, false );
        document.addEventListener( 'keyup', onKeyUp, false );
        document.addEventListener( 'mousedown', mouseDown);
        document.addEventListener( 'mouseup', mouseUp);

        raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

        // floor

        var floorGeometry = new THREE.PlaneBufferGeometry( 2000, 2000, 100, 100 );
        floorGeometry.rotateX( - Math.PI / 2 );

        // vertex displacement

        var position = floorGeometry.attributes.position;

        for ( var i = 0, l = position.count; i < l; i ++ ) {

          vertex.fromBufferAttribute( position, i );

          vertex.x += Math.random() * 20 - 10;
          vertex.y += Math.random() * 2;
          vertex.z += Math.random() * 20 - 10;

          position.setXYZ( i, vertex.x, vertex.y, vertex.z );

        }

        floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

        position = floorGeometry.attributes.position;
        var colors = [];

        for ( var i = 0, l = position.count; i < l; i ++ ) {

          color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
          colors.push( color.r, color.g, color.b );

        }

        floorGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

        var floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: true,wireframe : true } );

        var floor = new THREE.Mesh( floorGeometry, floorMaterial );
        scene.add( floor );

        const geometry = new THREE.BoxGeometry(20, 20, 20);
      const material = new THREE.MeshBasicMaterial( { color: 0x00ff00} );
      const cube = new THREE.Mesh( geometry, material );
      cube.position.y = 10;
      scene.add( cube );

      




      function mouseDown(event){
        isKlick = true;
      }
      function mouseUp(event){
        isKlick = false;
      }


function getShootDir(targetVec, bullet){
                var vector = targetVec;
                targetVec.set(0,0,1);
                vector.unproject(camera);
                var ray = new THREE.Ray(bullet.position, vector.sub(bullet.position).normalize() );
                targetVec.copy(ray.direction);
            }

        ggg = () =>{
              var bullet = new THREE.Mesh(
            new THREE.SphereGeometry(0.5,8,8),
            new THREE.MeshBasicMaterial({color: 0x00ff00}),
          )
          bullet.position.set(camera.position.x,camera.position.y, camera.position.z);
           var x = bullet.position.x - 0;
                    var y = bullet.position.y + 0;
                    var z = bullet.position.z + 0;

          var shootDirection = new THREE.Vector3();
          getShootDir(shootDirection, bullet);
          bullet.velocity = new THREE.Vector3(  shootDirection.x * 5,
                                            shootDirection.y * 5,
                                            shootDirection.z * 5);

          x += shootDirection.x * (1.0);
                    y += shootDirection.y * (1.0);
                    z += shootDirection.z * (1.0);
                    bullet.position.set(x,y,z);


                  //console.log(gun.position.x - camera.position.x, gun.position.y, gun.position.z - camera.position.z)
                  // console.log(camera.rotation.y, camera.rotation.z)

                  // if(camera.rotation.z > -Math.PI && camera.rotation.z < -Math.PI/2){
                  //   console.log("z = ", -15*Math.cos(camera.rotation.y), " x = ", -15*Math.sin(camera.rotation.y))
                  // }
                  // if(camera.rotation.z > -Math.PI/2 && camera.rotation.z < 0){
                  //   console.log("z = ", 15*Math.cos(camera.rotation.y), " x = ", -15*Math.sin(camera.rotation.y))
                  // }
                  
                  //console.log(gun.rotation.x, gun.rotation.y, gun.rotation.z)



          //var line = new THREE.Line(new THREE.Vector3(0,0,0), material);

          
            // bullet.velocity = new THREE.Vector3(
            //   -Math.sin(camera.rotation.y ),
            //   0,
            //   //camera.rotation.y
            //   Math.cos(camera.rotation.y)
            // )
         
          
          //console.log(camera.rotation.y)
          //console.log(camera.rotation.x, camera.rotation.y + Math.PI/2, camera.rotation.z)

          bullet.alive = true;
          setTimeout(()=>{
            bullet.alive = false;
            scene.remove(bullet)
          }, 1000);

          bullets.push(bullet);

          scene.add(bullet);
            }

          
        


      const loader = new THREE.OBJLoader()

loader.load( 'p90.obj', function ( gltf ) {

  gltf.children.forEach(function(child) {
  if (child.children.length == 1) {
    if (child.children[0] instanceof THREE.Mesh) {
      child.children[0].material = material;
    }
    }
  });
  //gltf.position.set( 20, 20, 20);
  //gltf.scale.set(0.3,0.3,0.3)
  //gltf.rotation.y = Math.PI;
  //gltf.position.set(20,20,20)

  //scaleToFit(gltf.scene, new THREE.Vector3(4, 4, 4));

  gun = gltf

  //createman(gun);

let px = gun.position.x
let py = gun.position.y
let pz = gun.position.z

socket.emit('newPlayer', {px, py, pz})

  //guns[]?
  scene.add( gun );




}, undefined, function ( error ) {

  console.error( error );

} )


socket.on('updatePlayers', guns =>{
  
  scene.children.forEach( obj => {
    if(obj.geometry){
      if(obj.geometry.type == "BoxGeometry"){
        scene.remove(obj);
      }
    }
  });

  for(let id in guns){
    let px = guns[id].px + 20
    let py = guns[id].py + 20
    let pz = guns[id].pz + 20
    addCube(scene, px, py, pz)
    console.log('updatePlayers : ', {px, py, pz} )
  }
})


function addCube(scene, x, y, z) {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshBasicMaterial({color: 0x44aa88});  // greenish blue
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = x
  cube.position.y = y
  cube.position.z = z
  scene.add(cube);
}




//let cube2BSP = new ThreeBSP(cube3);
function createman(gun){
  //const personbox = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshNormalMaterial());
  //const personbox2 = new THREE.Mesh(new THREE.BoxGeometry(11, 11, 11), new THREE.MeshNormalMaterial());
  let cube = new THREE.Mesh(new THREE.BoxGeometry(80, 80, 80), new THREE.MeshNormalMaterial());
  cube.position.set(30,30,30)
  //let cube2 = new THREE.Mesh(new THREE.BoxGeometry(90, 90, 90), new THREE.MeshNormalMaterial() );
  //cube2.position.x = 10;
  //let cube2BSP = new ThreeBSP(cube);
  //let cube1BSP = new ThreeBSP(cube2);
  //let resultBSP = cube1BSP.subtract(cube2BSP);

      scene.add(cube)
      //debugger
      let cube2BSP = new ThreeBSP(cube);
}


        // objects

        //var boxGeometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
        //boxGeometry = boxGeometry.toNonIndexed(); // ensure each face has unique vertices

        //position = boxGeometry.attributes.position;
        // colors = [];

        // for ( var i = 0, l = position.count; i < l; i ++ ) {

        //   color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
        //   colors.push( color.r, color.g, color.b );

        // }

        //boxGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

        // for ( var i = 0; i < 500; i ++ ) {

        //   var boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, vertexColors: true } );
        //   boxMaterial.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

        //   var box = new THREE.Mesh( boxGeometry, boxMaterial );
        //   box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
        //   box.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
        //   box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

        //   scene.add( box );
        //   objects.push( box );

        // }

        //

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        //

        window.addEventListener( 'resize', onWindowResize, false );

      }

      function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }

      function animate() {

        requestAnimationFrame( animate );

for(let index=0; index<bullets.length; index++){
  if(bullets[index] === undefined) continue;
  if(bullets[index].alive === false){
    bullets.splice(index, 1);
    continue;
  }
  bullets[index].position.add(bullets[index].velocity);
}
        

        if ( controls.isLocked === true ) {

          raycaster.ray.origin.copy( controls.getObject().position );
          raycaster.ray.origin.y -= 10;

          var intersections = raycaster.intersectObjects( objects );

          var onObject = intersections.length > 0;

          var time = performance.now();
          var delta = ( time - prevTime ) / 1000;

          velocity.x -= velocity.x * 10.0 * delta;
          velocity.z -= velocity.z * 10.0 * delta;

          velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

          direction.z = Number( moveForward ) - Number( moveBackward );
          direction.x = Number( moveRight ) - Number( moveLeft );
          direction.normalize(); // this ensures consistent movements in all directions

          if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
          if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

          if ( onObject === true ) {

            velocity.y = Math.max( 0, velocity.y );
            canJump = true;

          }

          controls.moveRight( - velocity.x * delta );
          controls.moveForward( - velocity.z * delta );

          controls.getObject().position.y += ( velocity.y * delta ); // new behavior

          if ( controls.getObject().position.y < 10 ) {

            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;

          }

          prevTime = time;

        }

        if(gun){
          let ax = 15/Math.PI*2 *camera.rotation.y;
          if(camera.rotation.z > -Math.PI && camera.rotation.z < -2){
            gun.position.set( camera.position.x - ax, camera.position.y - 5 , camera.position.z + 15 - ax);
          }
          if(camera.rotation.z > -2 && camera.rotation.z < 0){
            gun.position.set( camera.position.x - ax, camera.position.y - 5 , camera.position.z + ax);
          }
          
          //gun.rotation.set(0,Math.PI + camera.rotation.y, 0)
// if(camera.rotation.z > -Math.PI && camera.rotation.z < -Math.PI/2){
//   gun.position.set( -15*Math.cos(camera.rotation.y), camera.position.y - 5 , camera.position.z + 15 - ax);
// }
//console.log(camera.rotation.y, -15*Math.cos(camera.rotation.y), camera.rotation.z)//, camera.rotation.z)


          //gun.position.set( camera.position.x , camera.position.y - 5 , camera.position.z);
          gun.position.set(
            camera.position.x - Math.sin(camera.rotation.y) - 1,
            camera.position.y - 5,
            camera.position.z + Math.cos(camera.rotation.y)
          )
          gun.rotation.set(
            0,
            //camera.rotation.x,
            camera.rotation.y - Math.PI,
            0
          )

         let pxx = gun.position.x
         let pyy = gun.position.y
         let pzz = gun.position.z

        // console.log({pxx, pyy, pzz})


         socket.emit('positionUpdateOnServer', {pxx, pyy, pzz})

         //socket.emit("positionUpdate", {gun.position.x, gun.position.y, gun.position.z})

          // gun.rotation.set(
          //   0,
          //   camera.rotation.y - Math.PI,
          //   0
          //   //camera.rotation.z

          // )


// if(camera.rotation.z > -Math.PI && camera.rotation.z < -Math.PI/2){
//   gun.position.set(camera.position.x -15*Math.sin(camera.rotation.y) , camera.position.y - 5 , camera.position.z -15*Math.cos(camera.rotation.y));
// }
//                   if(camera.rotation.z > -Math.PI/2 && camera.rotation.z < 0){
//                     gun.position.set( camera.position.x -15*Math.sin(camera.rotation.y) , camera.position.y - 5 , camera.position.z + 15*Math.cos(camera.rotation.y));
//                   }

          //gun.rotation.set(0, 0, 0)

          // gun.position.set(camera.position.x, camera.position.y - 10, camera.position.z )
          // gun.rotation.set(camera.rotation.x, camera.rotation.y + Math.PI, camera.rotation.z)
        }
        

if(isKlick){
        ggg()
      }

        renderer.render( scene, camera );

      }


// function scaleToFit(obj, bound) {
//   let box = new THREE.Box3().setFromObject(obj);
//   let size = new THREE.Vector3();
//   box.getSize(size);
//   let vScale = new THREE.Vector3().copy(bound).divide(size);
//   let scale = Math.min(vScale.x, Math.min(vScale.y, vScale.z));
//   obj.scale.setScalar(scale);
// }