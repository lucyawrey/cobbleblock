import * as THREE from 'three'

interface Cube {
  origin: number[]
  size: number[]
  uv: [number, number]
  inflate?: number
  mirror?: boolean
  pivot?: number[]
  rotation?: number[]
}

interface Bone {
  name: string
  parent?: string
  pivot: number[]
  rotation?: number[]
  mirror?: boolean
  inflate?: number
  cubes?: Cube[]
}

type Channel = number | string | (number | string)[] | Record<string, unknown>

export interface BedrockPose {
  bones: Record<string, { rotation?: Channel, position?: Channel, scale?: Channel }>
  hidden: string[]
}

export interface BedrockGeometry {
  'minecraft:geometry': { description: { texture_width: number, texture_height: number }, bones: Bone[] }[]
}

// Bedrock's x axis runs the other way from three's; the flips follow Blockbench's importer.
const point = ([x = 0, y = 0, z = 0]: number[]) => new THREE.Vector3(-x, y, z)
const angles = ([x = 0, y = 0, z = 0]: number[] = []) =>
  new THREE.Euler(THREE.MathUtils.degToRad(-x), THREE.MathUtils.degToRad(-y), THREE.MathUtils.degToRad(z), 'ZYX')

const math: Record<string, unknown> = {
  sin: (degrees: number) => Math.sin(THREE.MathUtils.degToRad(degrees)),
  cos: (degrees: number) => Math.cos(THREE.MathUtils.degToRad(degrees)),
  clamp: (value: number, min: number, max: number) => Math.min(Math.max(value, min), max),
  lerp: (a: number, b: number, t: number) => a + (b - a) * t,
  abs: Math.abs, min: Math.min, max: Math.max, sqrt: Math.sqrt, floor: Math.floor, ceil: Math.ceil, round: Math.round,
  pi: Math.PI
}

// Molang at time 0: queries and variables read as 0, and anything this can't run reads as 0 too.
function molang(value: number | string) {
  if (typeof value === 'number') return value
  const js = value.toLowerCase().replace(/\b(?:q|query|v|variable|t|temp|c|context)\.\w+/g, '0').replace(/\bmath\./g, 'm.')
  try {
    return Number(new Function('m', `return (${js})`)(math)) || 0
  } catch {
    return 0
  }
}

// An animation channel's first keyframe, as three numbers.
function firstFrame(channel: Channel | undefined): number[] | undefined {
  if (channel === undefined) return undefined
  if (typeof channel !== 'object') return [channel, channel, channel].map(molang)
  if (Array.isArray(channel)) return channel.map(molang)
  // Keyframes by time; a keyframe is a value or { pre, post } (or { vector } in some files).
  const frame = Object.entries(channel).sort(([a], [b]) => Number(a) - Number(b))[0]?.[1] as Channel | undefined
  if (frame && typeof frame === 'object' && !Array.isArray(frame)) return firstFrame((frame.post ?? frame.vector ?? frame.pre) as Channel | undefined)
  return firstFrame(frame)
}

// Box UV: one strip of the texture per cube, unfolded as Minecraft does, in BoxGeometry's face order (east, west, up, down, south, north).
function boxUv(cube: Cube, mirror: boolean, width: number, height: number) {
  const [w = 0, h = 0, d = 0] = cube.size
  const [u, v] = cube.uv
  let faces = [[u, v + d, d, h], [u + d + w, v + d, d, h], [u + d + w, v + d, -w, -d], [u + d + 2 * w, v, -w, d], [u + 2 * d + w, v + d, w, h], [u + d, v + d, w, h]]
  if (mirror) {
    faces = faces.map(([x, y, faceW, faceH]) => [x! + faceW!, y!, -faceW!, faceH!])
    faces = [faces[1]!, faces[0]!, ...faces.slice(2)]
  }
  return faces.flatMap(([x, y, faceW, faceH]) => [[x!, y!], [x! + faceW!, y!], [x!, y! + faceH!], [x! + faceW!, y! + faceH!]])
    .flatMap(([a, b]) => [a! / width, 1 - b! / height])
}

export function buildModel(geometry: BedrockGeometry, texture: THREE.Texture, pose?: BedrockPose) {
  const { description, bones } = geometry['minecraft:geometry'][0]!
  const material = new THREE.MeshLambertMaterial({ map: texture, alphaTest: 0.1, side: THREE.DoubleSide })
  const root = new THREE.Group()
  const groups = new Map(bones.map(bone => [bone.name, new THREE.Group()]))

  for (const bone of bones) {
    const group = groups.get(bone.name)!
    const parent = bones.find(other => other.name === bone.parent)
    const posed = pose?.bones[bone.name]
    const rotation = firstFrame(posed?.rotation) ?? [0, 0, 0]
    group.position.copy(point(bone.pivot).sub(point(parent?.pivot ?? []))).add(point(firstFrame(posed?.position) ?? []))
    group.rotation.copy(angles([0, 1, 2].map(axis => (bone.rotation?.[axis] ?? 0) + rotation[axis]!)))
    group.scale.fromArray(firstFrame(posed?.scale) ?? [1, 1, 1])
    group.visible = !pose?.hidden.includes(bone.name)
    ;(bone.parent ? groups.get(bone.parent)! : root).add(group)

    for (const cube of bone.cubes ?? []) {
      const inflate = cube.inflate ?? bone.inflate ?? 0
      const [w = 0, h = 0, d = 0] = cube.size
      const box = new THREE.BoxGeometry(w + inflate * 2, h + inflate * 2, d + inflate * 2)
      box.setAttribute('uv', new THREE.Float32BufferAttribute(boxUv(cube, cube.mirror ?? bone.mirror ?? false, description.texture_width, description.texture_height), 2))
      const mesh = new THREE.Mesh(box, material)
      const center = point([cube.origin[0]! + w / 2, cube.origin[1]! + h / 2, cube.origin[2]! + d / 2])
      const pivot = new THREE.Group()
      pivot.position.copy(point(cube.pivot ?? bone.pivot).sub(point(bone.pivot)))
      pivot.rotation.copy(angles(cube.rotation))
      mesh.position.copy(center.sub(point(cube.pivot ?? bone.pivot)))
      pivot.add(mesh)
      group.add(pivot)
    }
  }
  return root
}
