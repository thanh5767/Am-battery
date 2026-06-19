package com.example.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "battery_records")
data class BatteryRecord(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val timestamp: Long,
    val currentMa: Float,
    val voltageV: Float,
    val powerW: Float,
    val temperatureC: Float,
    val percentage: Int,
    val isCharging: Boolean
)
