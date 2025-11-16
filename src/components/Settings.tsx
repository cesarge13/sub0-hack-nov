import { useState } from 'react';
import { User, Bell, Shield, Key, Globe, CheckCircle } from 'lucide-react';

export function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    ttlAlerts: true,
    securityAlerts: true,
    weeklyReport: false
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account and system configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <SettingsCard icon={User} title="Profile" color="teal">
          <div className="space-y-4">
            <Input label="Organization Name" defaultValue="Enterprise Corp" />
            <Input label="Contact Email" defaultValue="admin@enterprise.com" />
            <Input label="Admin Name" defaultValue="John Doe" />
            <button className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium">
              Update Profile
            </button>
          </div>
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard icon={Bell} title="Notifications" color="amber">
          <div className="space-y-4">
            <Toggle 
              label="Email Notifications" 
              enabled={notifications.email}
              onChange={() => setNotifications({...notifications, email: !notifications.email})}
            />
            <Toggle 
              label="TTL Alerts" 
              enabled={notifications.ttlAlerts}
              onChange={() => setNotifications({...notifications, ttlAlerts: !notifications.ttlAlerts})}
            />
            <Toggle 
              label="Security Alerts" 
              enabled={notifications.securityAlerts}
              onChange={() => setNotifications({...notifications, securityAlerts: !notifications.securityAlerts})}
            />
            <Toggle 
              label="Weekly Reports" 
              enabled={notifications.weeklyReport}
              onChange={() => setNotifications({...notifications, weeklyReport: !notifications.weeklyReport})}
            />
          </div>
        </SettingsCard>

        {/* Security */}
        <SettingsCard icon={Shield} title="Security" color="emerald">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-2">
                <Shield className="w-5 h-5" />
                <span className="font-medium">2FA Enabled</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Your account is protected</p>
            </div>
            <button className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-lg transition-colors font-medium">
              Change Password
            </button>
            <button className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-lg transition-colors font-medium">
              Manage API Keys
            </button>
          </div>
        </SettingsCard>
      </div>

      {/* Arkiv API Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center">
            <Key className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Arkiv SDK Configuration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your Arkiv Protocol integration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">API Endpoint</label>
            <input
              type="text"
              defaultValue="https://api.arkiv.network/v1"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">API Key</label>
            <input
              type="password"
              defaultValue="ak_live_xxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
            <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">System Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">All systems operational</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusItem label="Mendoza Network" status="online" />
          <StatusItem label="IPFS Gateway" status="online" />
          <StatusItem label="Arkiv Protocol" status="online" />
          <StatusItem label="Database" status="online" />
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ icon: Icon, title, color, children }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-500/10 border border-${color}-200 dark:border-${color}-500/20 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Input({ label, defaultValue }: any) {
  return (
    <div>
      <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">{label}</label>
      <input
        type="text"
        defaultValue={defaultValue}
        className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
}

function Toggle({ label, enabled, onChange }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-900 dark:text-white">{label}</span>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-teal-600' : 'bg-gray-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function StatusItem({ label, status }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
      <span className="text-sm text-gray-900 dark:text-white">{label}</span>
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-emerald-500" />
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{status}</span>
      </div>
    </div>
  );
}
