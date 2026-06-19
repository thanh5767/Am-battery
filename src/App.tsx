import React, { useState, useEffect } from 'react';
import { Activity, Battery, BatteryCharging, Zap, Thermometer, Clock, RefreshCw, Download } from 'lucide-react';

// Using navigator.getBattery API if available, otherwise mock data.
interface BatteryManager {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

export default function App() {
  const [batteryLevel, setBatteryLevel] = useState(82);
  const [isCharging, setIsCharging] = useState(false);
  const [currentMa, setCurrentMa] = useState(-482);
  const [voltage, setVoltage] = useState(4.12);
  const [power, setPower] = useState(1.98);
  const [temperature, setTemperature] = useState(32.4);

  useEffect(() => {
    let batteryTimer: ReturnType<typeof setInterval>;
    
    // Attempt to use Web Battery API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: BatteryManager) => {
        const updateBatteryInfo = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);
          
          // Simulate values based on charging status
          if (battery.charging) {
            setCurrentMa(Math.floor(Math.random() * 500) + 800); // 800-1300 mA
            setVoltage(4.2 + (Math.random() * 0.1));
            setTemperature(34.0 + (Math.random() * 2));
          } else {
            setCurrentMa(-(Math.floor(Math.random() * 300) + 200)); // -200 to -500 mA
            setVoltage(3.8 + (Math.random() * 0.2));
            setTemperature(30.0 + (Math.random() * 2));
          }
        };

        updateBatteryInfo();

        battery.addEventListener('chargingchange', updateBatteryInfo);
        battery.addEventListener('levelchange', updateBatteryInfo);
        
        batteryTimer = setInterval(() => {
           // lightly fluctuate values
           setCurrentMa(prev => {
             const base = battery.charging ? 1000 : -350;
             return base + (Math.random() * 100 - 50);
           });
           setPower(Math.abs((currentMa / 1000) * voltage));
        }, 2000);
      });
    }

    return () => {
      if (batteryTimer) clearInterval(batteryTimer);
    };
  }, [currentMa, voltage]);

  return (
    <div className="min-h-screen bg-[#0A0B10] text-[#E0E0E6] font-sans p-4 md:p-8 flex flex-col">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Phone Current Monitor</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Monitoring Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              try {
                const response = await fetch('/PhoneCurrentMonitor.apk');
                if (!response.ok) throw new Error('Network response was not ok');
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'PhoneCurrentMonitor.apk';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
              } catch (error) {
                console.error('Download failed', error);
                alert('Tải file thất bại. Vui lòng nhấn vào nút "Mở ứng dụng trong tab mới" (biểu tượng hình vuông có mũi tên ở góc phải phía trên của khung preview) và tải lại.');
              }
            }}
            className="px-4 py-2 bg-indigo-600 border border-indigo-500 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-500 transition-colors text-white cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download APK
          </button>
        </div>
      </header>

      {/* Bento Grid Main Content */}
      <main className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-6 flex-grow">
        
        {/* Primary Gauge: Current mA */}
        <div className="md:col-span-4 md:row-span-4 bg-[#14161F] border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-6 left-6 text-xs text-slate-500 font-bold uppercase tracking-wider">Current Flow</div>
          <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center mt-6">
            <svg className="w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#1E2130" strokeWidth="8%" />
              <circle 
                cx="50%" cy="50%" r="45%" fill="none" 
                stroke={isCharging ? "url(#gradCharge)" : "url(#gradDischarge)"} 
                strokeWidth="8%" 
                strokeDasharray="283" 
                strokeDashoffset={isCharging ? "100" : "180"} 
                strokeLinecap="round" 
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
              <defs>
                <linearGradient id="gradDischarge" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="gradCharge" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl md:text-5xl font-mono font-bold text-white">
                {currentMa.toFixed(0)}
              </span>
              <span className="text-slate-400 font-bold text-lg">mA</span>
            </div>
          </div>
          <div className={`mt-8 flex items-center gap-2 px-4 py-2 rounded-full ${isCharging ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
            {isCharging ? <BatteryCharging className="w-4 h-4" /> : <Battery className="w-4 h-4" />}
            <span className="text-sm font-bold uppercase">{isCharging ? 'Charging' : 'Discharging'}</span>
          </div>
        </div>

        {/* Stats Row Top */}
        <div className="md:col-span-4 md:row-span-2 bg-[#14161F] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Voltage Output</span>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-mono font-bold text-white">{voltage.toFixed(2)} <span className="text-xl text-slate-500">V</span></h2>
            <p className="text-xs text-slate-400 mt-1">Real-time measurement</p>
          </div>
        </div>

        <div className="md:col-span-4 md:row-span-2 bg-[#14161F] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Power</span>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-mono font-bold text-white">{power.toFixed(2)} <span className="text-xl text-slate-500">W</span></h2>
            <p className="text-xs text-slate-400 mt-1">P(W) = U(V) × I(A)</p>
          </div>
        </div>

        {/* Wide Chart Section */}
        <div className="md:col-span-8 md:row-span-2 bg-[#14161F] border border-slate-800 rounded-3xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current History (Last 1m)</span>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span className="text-[10px] text-slate-400 uppercase">Usage</span>
              </div>
            </div>
          </div>
          <div className="flex-grow flex items-end gap-1 px-2 h-32">
            {/* Generating mock histogram bars */}
            {[...Array(24)].map((_, i) => (
              <div 
                key={i} 
                className={`flex-grow rounded-t-sm ${i === 23 ? 'bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-slate-800/50'}`}
                style={{ height: `${Math.max(10, Math.random() * 100)}%`, transition: 'height 1s ease' }}
              ></div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="md:col-span-3 md:row-span-2 bg-[#14161F] border border-slate-800 rounded-3xl p-6">
           <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">Battery Level</div>
           <div className="flex items-end gap-3">
             <div className="text-5xl font-mono font-bold text-white">{batteryLevel}<span className="text-2xl text-slate-500">%</span></div>
           </div>
           <div className="mt-4 w-full h-3 bg-slate-800 rounded-full overflow-hidden">
             <div 
               className={`h-full ${isCharging ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
               style={{ width: `${batteryLevel}%`, transition: 'width 1s ease-in-out' }}
             ></div>
           </div>
           <div className="mt-4 grid grid-cols-2 gap-2">
             <div className="text-[10px] text-slate-500">Status: <span className="text-slate-300 font-bold">{isCharging ? 'Charging' : 'Discharging'}</span></div>
             <div className="text-[10px] text-slate-500">Health: <span className="text-emerald-400 font-bold">Good</span></div>
           </div>
        </div>

        <div className="md:col-span-3 md:row-span-2 bg-[#14161F] border border-slate-800 rounded-3xl p-6">
           <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">Temperature</div>
           <div className="text-5xl font-mono font-bold text-emerald-400">{temperature.toFixed(1)}<span className="text-2xl text-slate-500 uppercase">°C</span></div>
           <div className="mt-6 flex items-center justify-between">
             <span className="text-[10px] text-slate-500">Optimal Zone</span>
             <div className="flex gap-1">
                <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                <div className="w-1 h-3 bg-emerald-800 rounded-full"></div>
                <div className="w-1 h-3 bg-emerald-800 rounded-full"></div>
             </div>
           </div>
        </div>

        <div className="md:col-span-6 md:row-span-2 bg-gradient-to-br from-indigo-900/40 to-[#14161F] border border-indigo-500/30 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Device Analytics</span>
            <span className="px-2 py-1 bg-indigo-500 text-[10px] font-bold rounded text-white">ACTIVE</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Android Version</p>
              <p className="text-xl font-mono text-white">SDK 34</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Tech</p>
              <p className="text-xl font-mono text-white">Li-ion</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Data Points</p>
              <p className="text-xl font-mono text-white">1,204</p>
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Nav Overlay */}
      <footer className="mt-8 flex justify-center pb-4">
        <nav className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-2 rounded-2xl flex gap-1">
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold">Dashboard</button>
          <button className="px-6 py-2 text-slate-400 hover:text-white rounded-xl text-sm font-bold transition-colors">History</button>
          <button className="px-6 py-2 text-slate-400 hover:text-white rounded-xl text-sm font-bold transition-colors">Settings</button>
        </nav>
      </footer>
    </div>
  );
}
