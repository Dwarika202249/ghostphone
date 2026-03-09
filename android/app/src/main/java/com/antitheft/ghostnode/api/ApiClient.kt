package com.antitheft.ghostnode.api

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.Response
import com.antitheft.ghostnode.BuildConfig

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
    // Dynamic BASE_URL passed from Gradle (local.properties) during compilation.
    private val BASE_URL = BuildConfig.API_BASE_URL

    val instance: TelemetryApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(TelemetryApiService::class.java)
    }
}
