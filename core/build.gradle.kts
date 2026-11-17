import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("java")
    id("net.neoforged.moddev")
    kotlin("jvm")
}


group = "com.lucyazalea"
version = "1.0.0"
base.archivesName = "CobbleblockCore"

neoForge {
    version = "21.1.249"
    mods {
        create("cobbleblockcore") { sourceSet(sourceSets.main.get()) }
    }
    runs {
        create("packClient") {
            client()
            gameDirectory = rootProject.file("run")
            jvmArgument("-Xmx6G")
            // Set in ~/.gradle/gradle.properties to play as your own account, so saves and islands recognise you, and to open a save directly.
            providers.gradleProperty("cobbleblock.username").orNull?.let { programArguments.addAll("--username", it) }
            providers.gradleProperty("cobbleblock.uuid").orNull?.let { programArguments.addAll("--uuid", it) }
            providers.gradleProperty("cobbleblock.quickPlayWorld").orNull?.let { programArguments.addAll("--quickPlaySingleplayer", it) }
        }
    }
}

repositories {
    mavenCentral()
    maven("https://hub.spigotmc.org/nexus/content/groups/public/")
    maven("https://maven.neoforged.net/releases/")
    maven("https://thedarkcolour.github.io/KotlinForForge/")
    maven("https://artefacts.cobblemon.com/releases/")
}

dependencies {
    compileOnly("com.cobblemon:neoforge:1.8.4+1.21.1") { isTransitive = false }
    compileOnly("thedarkcolour:kotlinforforge-neoforge:5.12.0") {
        exclude("net.neoforged.fancymodloader", "loader")
    }
    testImplementation("org.junit.jupiter:junit-jupiter-api:5.10.0")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.10.0")
    testImplementation(kotlin("test"))
}

tasks {
    test {
        useJUnitPlatform()
    }

    processResources {
        inputs.property("version", project.version)

        filesMatching("META-INF/neoforge.mods.toml") {
            expand(project.properties)
        }
    }

    java {
        withSourcesJar()
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    compileJava {
        options.release = 21
    }

    compileKotlin {
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_21)
        }
    }
}

tasks.named("preparePackClientRun") { dependsOn(":syncPackRun") }

// Converts a structure template to SNBT text and back: `-Pfile=<path to .nbt or .snbt>`, relative to the repo root.
val templates: SourceSet by sourceSets.creating
neoForge.addModdingDependenciesTo(templates)
for ((task, mode) in listOf("templateToText" to "to-text", "templateFromText" to "from-text")) {
    tasks.register<JavaExec>(task) {
        group = "templates"
        classpath = templates.runtimeClasspath
        mainClass = "com.lucyazalea.cobbleblockcore.templates.TemplateText"
        argumentProviders.add { listOf(mode, rootProject.file(providers.gradleProperty("file").get()).path) }
    }
}
