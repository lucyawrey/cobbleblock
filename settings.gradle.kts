rootProject.name = "cobbleblock"

pluginManagement {
    repositories {
        maven("https://maven.fabricmc.net/")
        maven("https://maven.architectury.dev/")
        maven("https://maven.neoforged.net/releases/")
        gradlePluginPortal()
    }
}

include("core", "wild-loot", "wild-loot:common", "wild-loot:neoforge", "wild-loot:fabric")
