# gltf-merge

一个用于 多个 gltf 依赖资源合并的工具，适用于换材质、换网格，并且不同组合需要按需下载的场景

> 合并输入的 gltf/glb 的之间所包含的 buffers 和 images，让其指向同一个文件
> 并非把多个 gltf/glb 合成一个，如果想找这个，可用[gltf-transform](https://gltf-transform.donmccurdy.com/cli.html)

## 适用场景

<div>
  <img src="https://raw.githubusercontent.com/deepkolos/gltf-merge/master/demo.gif" width="250" alt="" />
</div>

比如包有开关状态，需要有两个网格，状态之间很多纹理是可复用的情况，法线、UV 等，但是包之间需要按需加载。

一种方法是手动关联贴图，自己维护一个颜色之间的贴图切换列表，
之前尝试过，texture 不仅仅只有图片，还有 flipY 等设置，
这些也得通过配置，维护这个配置十分耗精力，并且某张贴图出现奇怪的情况，无法被环境光照亮。

所以了有了另一种：纹理和网格的关联还是通过 gltf 关联，只是通过文件名相同来实现**下载复用**，
WebGL 纹理复用则需要渲染之前替换为已经上传过的 Texture，虽然冗余创建，只要不上传就不消耗 WebGL 资源

但是这里的文件关联是由模型的同学手动关联，在模型迭代的时候会多次出现由于某个包颜色修改了网格
导致依赖这个网格.bin 文件的 gltf 就会无法加载，也需要手动检查模型合并的问题。

所以有了这个项目，模型组还是输出单独的模型，然后再生成分散的 gltf，通过 hash 检测能否 gltf 之间依赖的资源
然后在批量导出最终产物，保证了输出的 gltf 都是能正常加载的。

## 命令行使用

```sh
> npm i gltf-merge -S
> gltf-merge -i ./exmaples/glb
```

## NPM 包 使用

不仅仅复用文件，也复用已经上传到 `WebGL` 的纹理，减少切换模型时上传纹理耗时

```js
import { GLTFLoader } from 'three-platfromzie/examples/jsm/loaders/GLTFLoader';
import GLTFMerge from 'gltf-merge';

const gltfMerge = new GLTFMerge();
const gltfLoader = new GLTFLoader();

gltfLoader.loadAsync('test.glb').then(gltf => {
  gltf.scene.traverse(gltfMerge.updateSharedTexture);
});

// 结束使用后
gltfMerge.dispose();
```

## TODO

0. 集成常用的压缩选项 meshopt 和 draco
