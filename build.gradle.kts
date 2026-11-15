plugins {
    kotlin("jvm") version ("2.4.0") apply false
    id("com.gradleup.shadow") version ("9.3.1") apply false
    id("dev.architectury.loom") version ("1.11-SNAPSHOT") apply false
    id("architectury-plugin") version ("3.4-SNAPSHOT") apply false
    id("net.neoforged.moddev") version ("2.0.148") apply false
}

val packDir = file("pack")
val runDir = file("run")

fun parseJson(f: File) = groovy.json.JsonSlurper().parse(f) as Map<*, *>

fun wildLootJar(): String {
    val projects = parseJson(packDir.resolve("pakku-lock.json"))["projects"] as List<Map<*, *>>
    val wildLoot = projects.first { (it["slug"] as Map<*, *>)["modrinth"] == "cobblemon-wild-loot" }
    return ((wildLoot["files"] as List<Map<*, *>>).first())["file_name"] as String
}

val fetchPack by tasks.registering(Exec::class) {
    workingDir(packDir)
    // --shelve moves unknown files in Pakku's folders aside instead of deleting them.
    commandLine("pakku", "fetch", "--shelve")
}

val syncPackMods by tasks.registering(Sync::class) {
    dependsOn(fetchPack)
    val wildLoot = wildLootJar()
    from(packDir.resolve("mods")) { exclude { it.name == wildLoot } }
    from(project(":wild-loot:neoforge").tasks.named("remapJar"))
    into(runDir.resolve("mods"))
}

val syncPackRun by tasks.registering(Copy::class) {
    dependsOn(syncPackMods)
    val overrides = parseJson(packDir.resolve("pakku.json"))["overrides"] as List<String>
    from(packDir) { include(overrides.flatMap { listOf(it, "$it/**") }) }
    into(runDir)
    doNotTrackState("The game also writes to run/, and tracked files must overwrite its copies on every launch.")
    // Copy never deletes, so remove fetched Paxi packs first or old versions stay beside new ones.
    doFirst { delete(fileTree(runDir.resolve("config/paxi")) { include("*/*.zip") }) }
}

tasks.register<Exec>("exportPack") {
    workingDir(packDir)
    commandLine("pakku", "export")
    doFirst { delete(packDir.resolve("build/modrinth")) }
    doLast {
        val mrpack = packDir.resolve("build/modrinth").listFiles { f -> f.extension == "mrpack" }!!.single()
        java.nio.file.FileSystems.newFileSystem(mrpack.toPath()).use { zip ->
            val index = groovy.json.JsonSlurper().parse(java.nio.file.Files.newInputStream(zip.getPath("modrinth.index.json"))) as Map<*, *>
            // Fetched Paxi packs sit inside the config override, so Pakku also bundles them as overrides.
            (index["files"] as List<Map<*, *>>).forEach { java.nio.file.Files.deleteIfExists(zip.getPath("overrides/${it["path"]}")) }
        }
    }
}
