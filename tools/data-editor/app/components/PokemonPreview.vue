<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const props = defineProps<{ id: string }>()

const { data } = await useFetch<{ geometry: BedrockGeometry, texture: string, pose?: BedrockPose } | null>(() => `/api/pokemon/${props.id}/model`)

const canvas = useTemplateRef('canvas')
let renderer: THREE.WebGLRenderer | undefined
let controls: OrbitControls | undefined
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000)
scene.add(new THREE.AmbientLight(0xffffff, 2), new THREE.DirectionalLight(0xffffff, 1.5))
const render = () => renderer?.render(scene, camera)

async function show() {
  scene.getObjectByName('model')?.removeFromParent()
  if (!data.value) return render()
  const texture = await new THREE.TextureLoader().loadAsync(data.value.texture)
  texture.magFilter = texture.minFilter = THREE.NearestFilter
  texture.colorSpace = THREE.SRGBColorSpace
  const model = buildModel(data.value.geometry, texture, data.value.pose)
  model.name = 'model'
  scene.add(model)

  // Frame the model from its front three-quarter side; Cobblemon models face -z.
  const box = new THREE.Box3().setFromObject(model)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3()).length()
  camera.position.copy(center).add(new THREE.Vector3(0.6, 0.35, -1).normalize().multiplyScalar(size * 1.4))
  controls!.target.copy(center)
  controls!.update()
  render()
}

onMounted(() => {
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value!, antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(canvas.value!.clientWidth, canvas.value!.clientHeight, false)
  controls = new OrbitControls(camera, canvas.value!)
  controls.addEventListener('change', render)
  show()
})
watch(data, show)
onBeforeUnmount(() => {
  controls?.dispose()
  renderer?.dispose()
})
</script>

<template>
  <div class="relative size-52 shrink-0 rounded-xl border border-default">
    <canvas
      ref="canvas"
      class="size-full cursor-grab"
    />
    <span
      v-if="!data"
      class="absolute inset-0 flex items-center justify-center text-sm text-muted"
    >
      No model
    </span>
  </div>
</template>
