import * as tf from '@tensorflow/tfjs-node';
declare function loadModel(): Promise<tf.GraphModel>;
declare function predict(base64Image: string): Promise<string[]>;
export { loadModel, predict };
//# sourceMappingURL=ml-model.d.ts.map