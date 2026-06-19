package com.example.model

data class BatteryData(
    val currentMa: Float,
    val voltageV: Float,
    val powerW: Float,
    val temperatureC: Float,
    val percentage: Int,
    val isCharging: Boolean,
    val isEstimated: Boolean = false
)
