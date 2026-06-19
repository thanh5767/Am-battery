package com.example.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.example.database.AppDatabase
import com.example.repository.BatteryRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class BatteryMonitorService : Service() {
    private val serviceJob = Job()
    private val serviceScope = CoroutineScope(Dispatchers.IO + serviceJob)
    private lateinit var repository: BatteryRepository

    override fun onCreate() {
        super.onCreate()
        val dao = AppDatabase.getDatabase(applicationContext).batteryDao()
        repository = BatteryRepository(applicationContext, dao)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(1, buildNotification("Monitoring battery status..."))
        
        serviceScope.launch {
            while (isActive) {
                repository.updateBatteryStats()
                repository.saveCurrentState()
                
                val state = repository.batteryState.value
                if (state != null) {
                    val notifManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                    val text = "Current: ${"%.0f".format(state.currentMa)} mA | ${"%.2f".format(state.powerW)} W"
                    notifManager.notify(1, buildNotification(text))
                }
                delay(1000)
            }
        }
        return START_STICKY
    }

    private fun buildNotification(text: String) = NotificationCompat.Builder(this, "battery_channel")
        .setContentTitle("Battery Monitor Active")
        .setContentText(text)
        .setSmallIcon(android.R.drawable.ic_dialog_info)
        .setOngoing(true)
        .build()

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel("battery_channel", "Battery Monitor", NotificationManager.IMPORTANCE_LOW)
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        serviceJob.cancel()
    }
}
