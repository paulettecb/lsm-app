import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-cpu';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HandGesturesService } from '../../utils/hand-gestures.service';
import { AvatarAnimationsService } from '../../utils/avatar-animations.service';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

@Component({
  selector: 'app-lsm-avatar',
  templateUrl: './lsm-avatar.component.html',
  styleUrls: ['./lsm-avatar.component.scss']
})
export class LsmAvatarComponent implements OnInit {
  @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef;
  @ViewChild('video', { static: true }) videoRef!: ElementRef;
  @ViewChild('handCanvas', { static: true }) handCanvasRef!: ElementRef;  // New Canvas for Hand Visualization
  @ViewChild('poseCanvas', { static: true }) poseCanvasRef!: ElementRef;

  private ctx!: CanvasRenderingContext2D | null;  // Canvas Context for Hand Drawing

  constructor(
    private avatarService: AvatarAnimationsService,
    private handGestureService: HandGesturesService
  ) {}

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private handModel!: any;
  private avatar!: THREE.Object3D;
  private skeleton!: THREE.Skeleton;
  private poseModel!: any; // Declare it

  signs = [
    { nombre: 'Hola', animacion: 'wave' },
    { nombre: 'Gracias', animacion: 'thank_you' }
  ];

  async ngOnInit() {
    await tf.setBackend('webgl');
    await tf.ready();
    this.initThreeJS();
    await this.initHandTracking();
    await this.initPoseTracking();
    await this.loadAvatar();
    
    this.ctx = this.handCanvasRef.nativeElement.getContext('2d'); // Initialize Hand Canvas
  }

  private initThreeJS() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1, 3);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 4, 5);
    this.scene.add(ambientLight);
    this.scene.add(directionalLight);

    this.animate();
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  private async loadAvatar() {
    const loader = new GLTFLoader();
    loader.load('assets/avatar.glb', (gltf) => {
      this.avatar = gltf.scene;
      this.scene.add(this.avatar);
      this.extractSkeleton();
      this.avatar.scale.set(1.5, 1.5, 1.5);
    }, undefined, (error) => console.error('Error loading model:', error));
  }

  private extractSkeleton() {
    const skinnedMesh = this.avatar.getObjectByProperty("type", "SkinnedMesh") as THREE.SkinnedMesh;
    if (skinnedMesh && skinnedMesh.skeleton) {
      this.skeleton = skinnedMesh.skeleton;
      console.log("✅ Skeleton Loaded:", this.skeleton);
    } else {
      console.warn("⚠️ No skeleton found in the model.");
    }
  }

  loadSign(sign: { nombre: string, animacion: string }) {
    console.log("🎬 Trying to animate:", sign.animacion);
  
    if (this.skeleton) {
      switch (sign.animacion) {
        case 'wave':
          this.avatarService.waveAvatar(this.skeleton);
          break;
        case 'thank_you':
          this.avatarService.nodAvatar(this.skeleton);
          break;
        default:
          console.warn("❌ Animation not found:", sign.animacion);
      }
    } else {
      console.warn("⚠️ Skeleton not loaded yet.");
    }
  }

  private async initHandTracking() {
    try {
      this.handModel = await handpose.load();
      const video = this.videoRef.nativeElement;

      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
          console.log("📸 Camera ready, starting detection...");
          this.detectHands();
        };
      });
    } catch (error) {
      console.error("Error initializing hand tracking:", error);
    }
  }

  private async initPoseTracking() {
    try {
        this.poseModel = await posedetection.createDetector(
            posedetection.SupportedModels.MoveNet, 
            { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );
        console.log("🏃‍♂️ Pose Model Loaded!");
    } catch (error) {
        console.error("⚠️ Error loading pose model:", error);
    }
}

  private async detectHands() {
    const video = this.videoRef.nativeElement;
    const canvas = this.poseCanvasRef.nativeElement;
    const ctx = canvas.getContext("2d");

    setInterval(async () => {
        const predictions = await this.handModel.estimateHands(video);
        const poses = await this.poseModel.estimatePoses(video);

        if (predictions.length > 0) {
            const landmarks = predictions[0].landmarks;
            this.drawHandLandmarks(landmarks);  // Draw the detected hand

            const handLandmarks = {
              wrist: landmarks[0],
              thumbBase: landmarks[1],
              thumbMCP: landmarks[2],
              thumbIP: landmarks[3],
              thumbTip: landmarks[4],
              indexBase: landmarks[5],
              indexMiddle: landmarks[6],
              indexKnuckle: landmarks[7],
              indexTip: landmarks[8],
              middleBase: landmarks[9],
              middleMiddle: landmarks[10],
              middleKnuckle: landmarks[11],
              middleTip: landmarks[12],
              ringBase: landmarks[13],
              ringMiddle: landmarks[14],
              ringKnuckle: landmarks[15],
              ringTip: landmarks[16],
              pinkyBase: landmarks[17],
              pinkyMiddle: landmarks[18],
              pinkyKnuckle: landmarks[19],
              pinkyTip: landmarks[20]
          };

            if (this.handGestureService.fistClosed(landmarks)) {
                console.log("✊ Fist Detected! → Avatar Stops");
                this.avatarService.stopAvatar(this.avatar, this.skeleton);
            } else if (this.handGestureService.palmOpen(landmarks)) {
                console.log("🖐️ Open Palm Detected! → Avatar Waves");
                this.loadSign({ nombre: 'Hola', animacion: 'wave' });
            } else if (this.handGestureService.thumbUp(landmarks)) {
                console.log("👍 Thumb Up Detected! → Avatar Nods");
                this.loadSign({ nombre: 'Gracias', animacion: 'thank_you' });
            }
        } if (poses.length > 0) {


          const POSE_CONNECTIONS = [
            [11, 12],  // Shoulders
            [11, 13], [13, 15],  // Left arm
            [12, 14], [14, 16],  // Right arm
            [11, 23], [12, 24],  // Spine to hips
            [23, 25], [25, 27],  // Left leg
            [24, 26], [26, 28],  // Right leg
          ];
        
          this.drawLandmarks(ctx, poses[0]?.landmarks, "blue");
          this.drawConnections(ctx, poses[0]?.landmarks, POSE_CONNECTIONS, "green");
      } else {
            console.log("🚫 No hands detected");
            this.clearHandCanvas();  // Clear the hand canvas when no hands are detected
        }
    }, 100);
  }

  // ✅ Function to Draw Hand Landmarks
  private drawHandLandmarks(landmarks: number[][]): void {
    if (!this.ctx || !landmarks) return;

    const ctx = this.ctx;
    const canvas = this.handCanvasRef.nativeElement;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Hand structure (connecting fingers)
    const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],  // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8],  // Index
        [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
        [0, 13], [13, 14], [14, 15], [15, 16],  // Ring
        [0, 17], [17, 18], [18, 19], [19, 20]  // Pinky
    ];

    // Draw connections
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    connections.forEach(([start, end]) => {
        ctx.beginPath();
        ctx.moveTo(landmarks[start][0], landmarks[start][1]);
        ctx.lineTo(landmarks[end][0], landmarks[end][1]);
        ctx.stroke();
    });

    // Draw landmarks
    ctx.fillStyle = 'red';
    landmarks.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
    });
  }

  // ✅ Clears the hand canvas when no hands are detected
  private clearHandCanvas(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.handCanvasRef.nativeElement.width, this.handCanvasRef.nativeElement.height);
  }

  private drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: any[], color: string) {
    ctx.fillStyle = color;
    for (const point of landmarks) {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI);
        ctx.fill();
    }
}

private drawConnections(ctx: CanvasRenderingContext2D, landmarks: any[], connections: number[][], color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    for (const [start, end] of connections) {
        if (landmarks[start] && landmarks[end]) {
            ctx.beginPath();
            ctx.moveTo(landmarks[start][0], landmarks[start][1]);
            ctx.lineTo(landmarks[end][0], landmarks[end][1]);
            ctx.stroke();
        }
    }
}
}