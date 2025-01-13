import { ShaderToonMaterial } from "./ShaderToonMaterial.js";

// TODO: Doesn't switch to this, fix
export class PlanetToonMaterial extends ShaderToonMaterial {
    constructor( dayTexture, nightTexture ) {
        texture1.value = dayTexture;
        texture2.value = nightTexture;
    }

}