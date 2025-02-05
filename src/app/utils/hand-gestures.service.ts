import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HandGesturesService {
  thumbConfidence = 0;
  confidenceThreshold = 3;
  palmConfidence = 0;
  palmThreshold = 3;
  constructor() { }

  thumbUp(landmarks:any) {
      if (!landmarks || landmarks.length < 21) return false;
  
      const thumbTip = landmarks[4];
      const thumbBase = landmarks[2];
      const indexKnuckle = landmarks[5];
      const wrist = landmarks[0];
  
      // Ensure thumb tip is above the index finger knuckle and extended outward
      if (
          thumbTip.y < indexKnuckle.y && // Thumb is above index knuckle
          thumbTip.x > thumbBase.x &&    // Thumb is extended outward
          wrist.y < thumbTip.y           // Wrist is below thumb
      ) {
          this.thumbConfidence++;
      } else {
          this.thumbConfidence = Math.max(0, this.thumbConfidence - 1);
      }
  
      return this.thumbConfidence >= this.confidenceThreshold;
  }

  palmOpen(landmarks: any) {
    if (!landmarks || landmarks.length < 21) return false;

    const fingersFolded =
        landmarks[8].y > landmarks[6].y &&  // Index finger
        landmarks[12].y > landmarks[10].y && // Middle finger
        landmarks[16].y > landmarks[14].y && // Ring finger
        landmarks[20].y > landmarks[18].y;   // Pinky

    const thumbOverPalm = landmarks[4].x < landmarks[5].x; // Thumb crosses over palm

    if (fingersFolded && thumbOverPalm) {
        this.palmConfidence++;
    } else {
        this.palmConfidence = Math.max(0, this.palmConfidence - 1);
    }

    return this.palmConfidence >= this.palmThreshold;
  }

  fistClosed(landmarks: any) {
    const tips = [8, 12, 16, 20];
    const joints = [6, 10, 14, 18];
    return tips.every((tip, i) => landmarks[tip][1] > landmarks[joints[i]][1]);
  }
}