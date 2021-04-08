import * as THREE from './three.module.js'
import { PointerLockControls } from './PointerLockControls.js'

export class Player {
    constructor(camera) {
        this._camera = camera;
        this._controls = new PointerLockControls(camera, document.body);
        this._raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
        this._gunRayCaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, 1), 0, 5000);

        document.addEventListener('keydown', this._onKeyDown.bind(this));
        document.addEventListener('keyup', this._onKeyUp.bind(this));
        document.addEventListener('mousedown', this._onMouseDown.bind(this));
        document.addEventListener('mouseup', this._onMouseUp.bind(this));

        this._velocity = new THREE.Vector3();

        this._moveForward  = false;
        this._moveBackward = false;
        this._moveLeft     = false;
        this._moveRight    = false;

        this._canJump      = false;
        this._isRunning    = false;

        this._isShooting   = false;
        this._hasShot      = false;
    }

    get controls() { return this._controls; }
    get object() { return this._controls.getObject() }

    _onKeyDown(event) {
        switch(event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this._moveForward = true;
                break;
            
            case 'ArrowDown':
            case 'KeyS':
                this._moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                this._moveRight = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                this._moveLeft = true;
                break;

            case 'Space':
                if (this._canJump === true) {
                    this._velocity.y += 100.0;
                    this._canJump = false;
                }
                break;
            
            case 'ShiftLeft':
                this._isRunning = true;
                break;
        }
    }

    _onKeyUp(event) {
        switch(event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this._moveForward = false;
                break;
            
            case 'ArrowDown':
            case 'KeyS':
                this._moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                this._moveRight = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                this._moveLeft = false;
                break;
                
            case 'ShiftLeft':
                this._isRunning = false;
                break;
        }
    }

    _onMouseDown(event) {
        switch (event.button) {
            case 0:
                this._isShooting = true;
                break;
        }
    }

    _onMouseUp(event) {
        switch (event.button) {
            case 0:
                this._isShooting = false;
                this._hasShot    = false;
                break;
        }
    }

    update(deltaTime, scene, physicsWorld) {
        // Shooting
        if (this._isShooting && !this._hasShot) {
            this._gunRayCaster.ray.origin.copy(this.object.position);
            this._camera.getWorldDirection(this._gunRayCaster.ray.direction);
            const interesections = this._gunRayCaster.intersectObjects(scene.children);

            if (interesections.length > 0) {
                let object = interesections[0].object;
                let rigidBody = object.userData.physicsBody;

                delete rigidBody.getMotionState();
                delete rigidBody.getCollisionShape();
                physicsWorld.removeRigidBody(rigidBody);

                scene.remove(object);
            }
            
            this._hasShot = true;
        }

        // Movement
        const speed = this._isRunning ? 2000.0 : 1000.0;
        const friction = 10.0;
        const gravity = 300.0;

        // Check for ground
        this._raycaster.ray.origin.copy(this.object.position);
        this._raycaster.ray.origin.y = -10;
        const interesections = this._raycaster.intersectObjects(scene.children);
        const onObject = interesections.length > 0;

        if (onObject === true) {
            this._velocity.y = Math.max(0, this._velocity.y);
            this._canJump = false;
        }

        this._velocity.y -= gravity * deltaTime;

        let direction = new THREE.Vector3();
        direction.z = Number(this._moveForward) - Number(this._moveBackward);
        direction.x = Number(this._moveRight) - Number(this._moveLeft);
        direction.normalize();

        // Friction
        this._velocity.x -= this._velocity.x * friction * deltaTime;
        this._velocity.z -= this._velocity.z * friction * deltaTime;

        if (this._moveForward || this._moveBackward) this._velocity.z -= direction.z * speed * deltaTime;
        if (this._moveLeft || this._moveRight) this._velocity.x -= direction.x * speed * deltaTime;

        this.controls.moveRight(-this._velocity.x * deltaTime);
        this.controls.moveForward(-this._velocity.z * deltaTime);
        this.object.position.y += this._velocity.y * deltaTime;

        if (this.object.position.y < 10) {
            this.object.position.y = 10;
            this._velocity.y = 0;
            this._canJump = true;
        }
    }
}