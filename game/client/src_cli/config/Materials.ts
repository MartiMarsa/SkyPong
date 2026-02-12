import { Color3 } from "@babylonjs/core";

export interface IMaterialOptions {
    uvScale?: number;
    uScale?: number;
    vScale?: number;
    folderPath?: string;
    normalLevel?: number;
    pbrMetallic?: number;
    pbrRoughness?: number;
    aoIntensity?: number;
    alpha?: number;
    albedoColor?: Color3;
    useOrm?: boolean;
    useAoMap?: boolean;
    emissiveColor?: Color3;
    useEmissiveMap?: boolean;
    emissiveIntensity?: number;
    isRefractive?: boolean;
    indexOfRefraction?: number;
    refractionIntensity?: number;
    linkRefractionWithTransparency?: boolean;
    tintColor?: Color3;
    tintColorAtDistance?: number;
    doubleSided?: boolean;
}

export const MAT = {
    INFO: {
        WOODFLOOR: {
            uvScale: 1,
            useOrm: true,
            pbrMetallic: 0,
            pbrRoughness: 0.03,
        },
        CLEARGLASS: {
            albedoColor: new Color3(2, 3, 0),
            alpha: 0.05,
            pbrRoughness: 0.0,
            pbrMetallic: 0.0,
            useOrm: false,
            isRefractive: true,
            indexOfRefraction: 1.52,
            refractionIntensity: 0.95,
            tintColor: new Color3(0.98, 0.98, 1.0),
            tintColorAtDistance: 0.5,
            doubleSided: false,
        },
        MARBLE: {
            pbrMetallic: 0.0,
            pbrRoughness: 0.1,
            useOrm: false,
        },
        EMISSIVEFACADE: {
            useEmissiveMap: true,
            emissiveIntensity: 2,
            emissiveColor: new Color3(1, 1, 1),
            pbrRoughness: 0.1,
            useOrm: true,
        },
        WATER: {
            albedoColor: new Color3(0.5, 0.7, 1),
            alpha: 0.2,
            pbrRoughness: 0.02,
            pbrMetallic: 0.0,
            useOrm: false,
            isRefractive: true,
            indexOfRefraction: 1.33,
            doubleSided: true,
        },
        SHINYMETAL: {
            pbrMetallic: 1,
            useOrm: true,
            pbrRoughness: 0.01,
            aoIntensity: 0,
            useAoMap: false,
        },
        PLASTIC: {
            uvScale: 2,
            normalLevel: 1,
            useAoMap: true,
            aoIntensity: 0,
            useOrm: true,
            pbrMetalic: 0,
            pbrRoughness: 0.3,
        },
        MOSS: {
            normalLevel: 3,
            useAoMap: true,
            useOrm: true,
            aoIntensity: 5,
        },
    },
};
