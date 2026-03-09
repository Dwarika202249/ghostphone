package com.antitheft.ghostnode.workers

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.antitheft.ghostnode.api.ApiClient
import com.antitheft.ghostnode.api.TelemetryPayload
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class TelemetryWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val lat = inputData.getDouble("lat", 0.0)
        val lng = inputData.getDouble("lng", 0.0)
        val bat = inputData.getInt("bat", -1)
        val net = inputData.getString("net") ?: "Unknown"
        val trigger = inputData.getString("trigger") ?: "interval"
        
        // Use the seeded fake device credentials
        val deviceId = "00000000-0000-0000-0000-000000000001"
        val apiKey = "secret-key-123"

        val payload = TelemetryPayload(
            latitude = lat,
            longitude = lng,
            battery = bat,
            network_type = net,
            trigger_source = trigger
        )

        try {
            val response = ApiClient.instance.sendTelemetry(deviceId, apiKey, payload)
            if (response.isSuccessful) {
                Log.d("GhostNode", "Telemetry sent successfully")
                Result.success()
            } else {
                Log.e("GhostNode", "Failed to send telemetry: ${response.code()}")
                Result.retry() // WorkManager will try again later!
            }
        } catch (e: Exception) {
            Log.e("GhostNode", "Network exception when sending telemetry", e)
            Result.retry()
        }
    }
}
