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
                // WorkManager queues it for next boot or fires instantly if possible
            }
            "android.telephony.action.SIM_STATE_CHANGED" -> {
                Log.d("GhostNode", "SIM Swap Detected! Triggering emergency telemetry.")
                startGhostService(context)
            }
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
