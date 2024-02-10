import * as p from "./imports";

for (let i = 0; i < Object.keys(p).length; i++) globalThis[Object.keys(p)[i]] = p[Object.keys(p)[i]];

globalThis.plugins = [];

for (let i = 0; i < Object.keys(p).length; i++) globalThis.plugins.push(
    {
        name: Object.keys(p)[i],
        path: Object.keys(p)[i],
        enabled: true
    }
);

export default globalThis.plugins;
