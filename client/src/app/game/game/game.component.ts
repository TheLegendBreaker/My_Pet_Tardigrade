import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  } from '@angular/core';

import * as THREE from 'three';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass']
})
export class GameComponent implements OnInit {
  @ViewChild('container', {static: false}) container: ElementRef;

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  sun: THREE.DirectionalLight;
  stats;
  controls;
  tardigrade: any;
  animations: any;
  clock: THREE.Clock;
  assetsPath: string;
  anims: string[];

  constructor() {}

  ngOnInit() {
    this.assetsPath = '../../../assets/';
    this.anims = ['Idle', 'swim', 'eat'];
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.clock = new THREE.Clock();
    this.init();
  }

  init(): void {
    // CAMERA
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 );
    this.camera.position.set(112, 100, 600);

    // ASSIGN SCENE
    this.scene = new THREE.Scene();

    // BACKDROP
    this.scene.background = new THREE.Color( 0xa0a0a0 );
    this.scene.fog = new THREE.Fog( 0xa0a0a0, 700, 4000 );

    // LIGHTING
    let hemiLight: THREE.HemisphereLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 200, 0 );

    const shadowSize = 200;

    let light: THREE.DirectionalLight = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 200, 100 );
    light.castShadow = true;
    light.shadow.camera.top = shadowSize;
    light.shadow.camera.bottom = -shadowSize;
    light.shadow.camera.left = -shadowSize;
    light.shadow.camera.right = shadowSize;

    this.sun = light;

    this.scene.add( light );
    this.scene.add(hemiLight );

    // GROUND
    const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry( 10000, 10000, ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ));
    mesh.rotation.x= - Math.PI / 2;
    mesh.receiveShadow = true;

    const grid = new THREE.GridHelper( 5000, 40, 0x000000, 0x000000 );
    grid.material.opacity = 0.2;
    grid.material.transparent = true;

    this.scene.add( mesh );
    this.scene.add( grid );

    // MODEL
    const loader = new THREE.FBXLoader();
    const game = this;

    loader.load( `${this.assetsPath}models/tardigrade1/source/waterbearLOW/waterbearArm.fbx`,  (object) => {

      object.mixer = THREE.AnimationMixer( object );
      game.tardigrade.mixer = object.mixer;
      game.tardigrade.root = object.mixer.getRoot();

      object.name = 'Tardigrade';

      // assign shadow to model
      object.traverse( child => {
        if(child.isMesh) {
	  child.castShadow = true;
	  child.receiveShadow = false;
	}
      });

      // assign texture to model
      const tLoader = new THREE.TextureLoader();
      tLoader.load( `${game.assetsPath}models/tardigrade1/source/waterbearLOW/DefaultMaterial_albedo.jbg`, texture => {
	object.traverse( child => {
	  if(child.isMesh) {
	    child.material.map = texture;
	  }
	});
      });

      game.tardigrade.object = new THREE.Object3D();
      game.scene.add(game.tardigrade.object);
      game.tardigrade.object.add( object );
      game.animations.Idle = object.animations[0];

      game.loadNextAnim( loader );
    });

    this.renderer.setPixelRatio(window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;
    this.container.nativeElement.appendChild(this.renderer.domElement);

    window.addEventListener( 'resize', ()=> game.onWindowResize(), false );

  }

  loadNextAnim(loader): void {
    let anim = this.anims.pop();
    const game = this;

    loader.load( `${this.assetsPath}models/tardigrade1/source/waterbearLOW/${anim}.fbx`, object=>{
      game.animations[anim] = object.animations[0];l
      if (game.anims.length > 0){
        game.loadNextAnim(loader);
      }else{
	game.createCameras();
	delete game.anims;
	game.action = 'Idle';
	game.animate()
      }

    });

  }

  moveTardigrade(dt) {
    // figure out movement patterns
    // figure out how the waterbear chase food.
  }

  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth / window.innerHeight );
  }

  set action(name) {
    const action = this.tardigrade.mixer.clipAction( this.animations[name] );
    action.time = 0;

    this.tardigrade.mixer.stopAllActions();
    this.tardigrade.action = name;
    this.tardigrade.actionTime = Date.now();

    action.fadeIn(0.5);
    action.play();
  }

  get action() {
    if ( this.tardigrade===undefined || this.tardigrade.actionName===undefined) return "";
    return this.tardigrade.action;
  }

  set activeCamera(object) {
    this.tardigrade.cameras.active = object;
  }

  createCameras(): void {
    const offset = new THREE.Vector(0, 80, 0);

    // front
    const front = new THREE.Object3D();
    front.position.set(112, 100, 600);
    front.parent = this.tardigrade.object;

    // back
    const back = new THREE.Object3D();
    back.postion.set(0, 300, -600);
    back.parent = this.tardigrade.object;

    // wide
    const wide = new THREE.Object3D();
    wide.position.set(178, 139, 1665);
    wide.parent = this.tardigrade.object;

    // overhead
    const overhead = new THREE.Object3D();
    overhead.position.set(0, 400, 0);
    overhead.parent = this.tardigrade.object;

    //collect
    const collect = new THREE.Object3D();
    collect.position.set(40, 82, 94);
    collect.parent = this.tardigrade.object;

    this.tardigrade.cameras = { front, back, wide, overhead, collect };
    this.activeCamera = this.tardigrade.cameras.back;

  }

  animate(): void {
    const game = this;
    const dt = this.clock.getDelta();

    requestAnimationFrame(() => game.animate() );

    if (this.tardigrade.mixer !== undefined) this.tardigrade.mixer.update(dt);

    if (this.tardigrade.camera !== undefined && this.tardigrade.cameras.active!==undefined){
      this.camera.position.lerp(this.tardigrade.cameras.active.getWorldPosition(new THREE.Vector3()), 0.05);
      const pos = this.tardigrade.object.position.clone();
      pos.y += 200;
      this.camera.lookAt(pos);
    }

    if (this.sun !== undefined){
      this.sun.position.x = this.tardigrade.object.position.x;
      this.sun.position.y = this.tardigrade.object.position.y + 200;
      this.sun.position.z = this.tardigrade.object.position.z + 100;

      this.sun.target = this.tardigrade.object;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
