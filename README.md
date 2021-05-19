# gltf-merge

一个用于 多个 gltf 依赖资源合并的工具，适用于换材质、换网格，并且不同组合需要按需下载的场景

> 合并输入的 gltf/glb 的之间所包含的 buffers 和 images，让其指向同一个文件
> 并非把多个 gltf/glb 合成一个，如果想找这个，可用[gltf-transform](https://gltf-transform.donmccurdy.com/cli.html)

## 适用场景

<div>
  <img src="https://raw.githubusercontent.com/deepkolos/gltf-merge/master/demo.gif" width="250" alt="" />
</div>

## 命令行使用

```sh
> npm i gltf-merge -S
> gltf-merge -h
```

## NPM 包 使用

```js
import { GLTFLoader } from 'three-platfromzie/examples/jsm/loaders/GLTFLoader';
import GLTFMerge from 'gltf-merge';

const gltfMerge = new GLTFMerge();
const gltfLoader = new GLTFLoader();

gltfLoader.loadAsync('test.glb').then(gltf => {
  gltf.scene.traverse(gltfMerge.updateSharedTexture);
});
```

## TODO

0. 集成常用的压缩选项 meshopt 和 draco
