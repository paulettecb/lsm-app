import { Injectable } from '@angular/core';
import * as THREE from "three";
import { bones } from './default-bones';

@Injectable({
  providedIn: 'root'
})
export class AvatarAnimationsService {
  constructor() { }

  waveAvatar(skeleton: THREE.Skeleton) {
    const rightHand = skeleton.bones.find(b => b.name === "mixamorigRightHand");
    if (rightHand) {
      rightHand.rotation.z = 0.8;  // 🔹 Moves hand sideways for a wave
      console.log("👋 Waving Hand!");
    } else {
      console.warn("⚠️ Right hand bone not found!");
    }
  }

  nodAvatar(skeleton: THREE.Skeleton) {
    const head = skeleton.bones.find(b => b.name === "mixamorigHead");
    if (head) {
      head.rotation.x = 0.3;  // 🔹 Moves head forward slightly
      console.log("🙏 Nodding Head!");
    } else {
      console.warn("⚠️ Head bone not found!");
    }
  }

  stopAvatar(avatar: any, skeleton: THREE.Skeleton) {
    if (avatar) {
        console.log("⛔ Stopping Avatar... Resetting position & scale");

        // ✅ Keep the scale constant (Make sure it's not resetting to something weird)
        avatar.scale.set(1.5, 1.5, 1.5);

        // ✅ Reset rotations (no more weird arm angles)
        avatar.rotation.set(0, 0, 0);
        avatar.position.set(0, 0, 0);

        skeleton.bones.forEach((bone) => {
          const boneDefaults = bones[bone.name as keyof typeof bones]; // Ensuring TypeScript knows the key exists
          if (boneDefaults) {
              bone.rotation.set(
                  boneDefaults.x,
                  boneDefaults.y,
                  boneDefaults.z
              );
          }
      });


        console.log("✅ Avatar stopped properly");
    }
  }
}