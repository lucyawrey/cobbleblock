package com.lucyazalea.cobbleblockcore

import net.minecraft.server.MinecraftServer
import net.neoforged.neoforge.event.server.ServerStoppedEvent
import net.neoforged.neoforge.event.tick.ServerTickEvent

/** Runs actions a number of server ticks later. Pending actions are dropped when the server stops. */
object Delayed {
    private class Task(val at: Int, val action: () -> Unit)

    private val tasks = ArrayList<Task>()

    fun run(server: MinecraftServer, ticks: Int, action: () -> Unit) {
        tasks += Task(server.tickCount + ticks, action)
    }

    fun onServerTick(event: ServerTickEvent.Post) {
        val now = event.server.tickCount
        val due = tasks.filter { it.at <= now }
        tasks.removeAll(due)
        due.forEach { it.action() }
    }

    fun onServerStopped(event: ServerStoppedEvent) = tasks.clear()
}
