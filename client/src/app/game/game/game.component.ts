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
  @ViewChild('container') container: ElementRef;

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  sun: THREE.DirectionalLight;
  stats;
  controls;
  tradigrade: object;
  animations: object;
  clock: THREE.Clock;
  assetsPath: string;

  constructor() {}

  ngOnInit() {
    this.assetsPath = '../../../assets/';
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.clock = new THREE.Clock();
    init();
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
      game.tardigrede.root = object.mixer.getRoot();

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
    this.container.appendChild( this.renderer.domElement );

    window.addEventListener( 'resize', ()=> game.onWindowResize();, false );
    
  }    
  animate(): void {
    const game = this;
    const dt = this.clock.getDelta();

    requestAnimationFrame(()=> game.animate(); );

    if (this.player.mixer !== undefined) this.player.mixer.update(dt);

    this.renderer.render(this.scene, this.camera);
  }
}
