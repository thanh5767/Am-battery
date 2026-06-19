package com.example.utils

import android.content.Context
import android.net.Uri
import android.os.Environment
import com.example.model.BatteryRecord
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.*

object ExportHelper {
    suspend fun exportToCSV(context: Context, records: List<BatteryRecord>): Uri? {
        return withContext(Dispatchers.IO) {
            try {
                val fileName = "BatteryLog_${System.currentTimeMillis()}.csv"
                val file = File(context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), fileName)
                
                val writer = FileWriter(file)
                writer.append("Time,Current(mA),Voltage(V),Power(W),Temperature(C),Percentage(%),Charging\n")
                
                val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
                
                records.forEach { record ->
                    val time = sdf.format(Date(record.timestamp))
                    writer.append("$time,${record.currentMa},${record.voltageV},${record.powerW},${record.temperatureC},${record.percentage},${record.isCharging}\n")
                }
                
                writer.flush()
                writer.close()
                Uri.fromFile(file)
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
    }
}
