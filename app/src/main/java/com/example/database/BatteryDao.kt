package com.example.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import com.example.model.BatteryRecord
import kotlinx.coroutines.flow.Flow

@Dao
interface BatteryDao {
    @Query("SELECT * FROM battery_records ORDER BY timestamp DESC LIMIT 500")
    fun getRecentHistory(): Flow<List<BatteryRecord>>

    @Insert
    suspend fun insert(record: BatteryRecord)
    
    @Query("DELETE FROM battery_records")
    suspend fun clearHistory()
}
