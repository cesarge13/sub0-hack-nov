import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { login, register } from '../services/auth';
import { useUser } from '../hooks/useUser';
import type { RegisterData } from '../types/user';

interface LoginProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function Login({ onClose, onSuccess }: LoginProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [sector, setSector] = useState<'agro' | 'industria' | 'energia'>('industria');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshSession } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        await refreshSession();
        onSuccess?.();
        onClose?.();
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const registerData: RegisterData = {
        email,
        password,
        name,
        organizationName,
        sector,
        role: 'viewer', // Por defecto viewer, admin puede cambiar después
      };

      const result = await register(registerData);
      
      if (result.success) {
        await refreshSession();
        onSuccess?.();
        onClose?.();
      } else {
        setError(result.error || 'Error al registrar usuario');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          {/* Register-only fields */}
          {!isLoginMode && (
            <>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>

              {/* Organization Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de Organización
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Mi Empresa S.A."
                />
              </div>

              {/* Sector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sector
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as 'agro' | 'industria' | 'energia')}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="agro">Agro</option>
                  <option value="industria">Industria</option>
                  <option value="energia">Energía</option>
                </select>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isLoginMode ? 'Iniciando sesión...' : 'Creando cuenta...'}
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </>
            )}
          </button>

          {/* Toggle Mode */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError(null);
              }}
              className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
            >
              {isLoginMode 
                ? '¿No tienes cuenta? Crear una cuenta' 
                : '¿Ya tienes cuenta? Iniciar sesión'}
            </button>
          </div>

          {/* Demo Credentials */}
          {isLoginMode && (
            <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Credenciales de demo:</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded">
                  <span className="text-gray-600 dark:text-gray-400">Admin:</span>
                  <code className="text-teal-600 dark:text-teal-400">admin@certifik.cl</code>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded">
                  <span className="text-gray-600 dark:text-gray-400">Certificador:</span>
                  <code className="text-teal-600 dark:text-teal-400">certifier@certifik.cl</code>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Contraseña: cualquier (mínimo 6 caracteres)</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

