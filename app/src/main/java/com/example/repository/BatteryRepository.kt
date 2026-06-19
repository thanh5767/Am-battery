package com.example.repository

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import com.example.database.BatteryDao
import com.example.model.BatteryData
import com.example.model.BatteryRecord
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class BatteryRepository(private val context: Context, private val batteryDao: BatteryDao) {

    private val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
    private val _batteryState = MutableStateFlow<BatteryData?>(null)
    val batteryState: StateFlow<BatteryData?> = _batteryState.asStateFlow()

    fun updateBatteryStats() {
        val intentFilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        val batteryStatus = context.registerReceiver(null, intentFilter)

        val currentNow = batteryManager.getLongProperty(BatteryManager.BATTERY_PROPERTY_CURRENT_NOW)
        // Convert to mA
        val currentMa = if (currentNow != Long.MIN_VALUE) {
            currentNow.toFloat() / 1000f
        } else {
            0f
        }

        val voltageMv = batteryStatus?.getIntExtra(BatteryManager.EXTRA_VOLTAGE, -1) ?: -1
        val voltageV = voltageMv.toFloat() / 1000f

        val powerW = (currentMa / 1000f) * voltageV

        val tempRaw = batteryStatus?.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, -1) ?: -1
        val temperatureC = tempRaw.toFloat() / 10f

        val level = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        val batteryPct = if (level != -1 && scale != -1) (level * 100 / scale) else -1
        
        val status = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
        val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL

        val data = BatteryData(
            currentMa = currentMa,
            voltageV = voltageV,
            powerW = powerW,
            temperatureC = temperatureC,
            percentage = batteryPct,
            isCharging = isCharging,
            isEstimated = currentNow == Long.MIN_VALUE
        )
        
        _batteryState.value = data
    }
    
    suspend fun saveCurrentState() {
        val data = _batteryState.value ?: return
        val record = BatteryRecord(
            timestamp = System.currentTimeMillis(),
            currentMa = data.currentMa,
            voltageV = data.voltageV,
            powerW = data.powerW,
            temperatureC = data.temperatureC,
            percentage = data.percentage,
            isCharging = data.isCharging
        )
        batteryDao.insert(record)
    }
}
