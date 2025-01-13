import { ShaderPhongMaterial } from "./ShaderPhongMaterial.js";

export class PlanetPhongMaterial extends ShaderPhongMaterial {
    constructor( dayTexture, nightTexture ) {
        super();

        this.uniforms.texture1.value = dayTexture;
        this.uniforms.texture2.value = nightTexture;
        this.uniforms.isStar.value = false;
    }

}