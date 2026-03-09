package com.antitheft.ghostnode.api

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.Response

data class TelemetryPayload(
    val latitude: Double,
    val longitude: Double,
    val battery: Int,
    val network_type: String,
    val trigger_source: String
)

interface TelemetryApiService {
    @POST("api/v1/telemetry/ingest")
    suspend fun sendTelemetry(
        @Header("X-Device-ID") deviceId: String,
        @Header("X-API-Key") apiKey: String,
        @Body payload: TelemetryPayload
    ): Response<Unit>
}

object ApiClient {
    // User's Local IP for Physical Device Testing
    private const val BASE_URL = "http://10.19.16.193:8000/"
    // private const val BASE_URL = "http://192.168.0.114:8000/"

    val instance: TelemetryApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(TelemetryApiService::class.java)
    }
}
