package com.example.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.database.AppDatabase
import com.example.repository.BatteryRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class BatteryViewModel(application: Application) : AndroidViewModel(application) {
    private val dao = AppDatabase.getDatabase(application).batteryDao()
    private val repository = BatteryRepository(application, dao)

    val batteryState = repository.batteryState
    val history = dao.getRecentHistory()

    init {
        viewModelScope.launch {
            while (isActive) {
                repository.updateBatteryStats()
                delay(1000)
            }
        }
    }
}
