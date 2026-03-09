package com.antitheft.ghostnode.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.antitheft.ghostnode.services.GhostLocationService

class SystemEventReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED -> {
                Log.d("GhostNode", "Boot Completed Payload Trapped! Starting Silent Service.")
                startGhostService(context)
            }
            Intent.ACTION_SHUTDOWN -> {
                Log.d("GhostNode", "Device shutting down! Attempting final telemetry burst...")
                // Note: Actual network calls during shutdown are flaky, 
                // but WorkManager will queue it for the next boot if it fails!
            }
            // "android.intent.action.SIM_STATE_CHANGED" is deprecated/restricted in newer APIs 
            // without system privileges, kept conceptual for the AntiTheft model
        }
    }

    private fun startGhostService(context: Context) {
        val serviceIntent = Intent(context, GhostLocationService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent)
        } else {
            context.startService(serviceIntent)
        }
    }
}
