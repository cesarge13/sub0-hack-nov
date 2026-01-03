import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Edit, Trash2, Search, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { usePermissions } from '../hooks/usePermissions';
import { getAllUsers, updateUserRole, getAllOrganizations } from '../services/auth';
import type { User, UserRole, Organization } from '../types/user';
import { getRoleName, getRoleDescription, ROLE_PERMISSIONS } from '../types/user';

export function UserManagement() {
  const { user: currentUser } = useUser();
  const { isAdmin, canManageUsers } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('viewer');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, orgsData] = await Promise.all([
        getAllUsers(),
        getAllOrganizations(),
      ]);
      setUsers(usersData);
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: UserRole) => {
    try {
      const success = await updateUserRole(userId, role);
      if (success) {
        await loadData();
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.organizationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (!isAdmin && !canManageUsers) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-1">
                Acceso Denegado
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                No tienes permisos para gestionar usuarios. Solo administradores pueden acceder a esta sección.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        Cargando usuarios...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 rounded-xl">
            <span className="text-sm font-medium text-teal-700 dark:text-teal-400">
              {users.length} usuario{users.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Todos los Roles</option>
            <option value="viewer">Visualizador</option>
            <option value="operator">Operador</option>
            <option value="esg_responsible">Responsable ESG</option>
            <option value="auditor">Auditor</option>
            <option value="certifier">Certificador</option>
            <option value="admin">Administrador</option>
          </select>

          <div className="flex items-center gap-2 px-4 py-3 text-gray-600 dark:text-gray-400">
            <Filter className="w-5 h-5" />
            <span className="text-sm">Mostrando {filteredUsers.length} usuarios</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Organización</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Wallet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
              {filteredUsers.map((user) => {
                const org = organizations.find(o => o.id === user.organizationId);
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{org?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{org?.sector || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400' :
                        user.role === 'certifier' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                        user.role === 'auditor' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' :
                        user.role === 'esg_responsible' ? 'bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400' :
                        user.role === 'operator' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                        'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400'
                      }`}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.walletAddress ? (
                        <code className="text-xs font-mono text-teal-600 dark:text-teal-400">
                          {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                        </code>
                      ) : (
                        <span className="text-xs text-gray-400">No vinculada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setNewRole(user.role);
                        }}
                        className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300 mr-4"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Editar Rol de Usuario
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {editingUser.name} ({editingUser.email})
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nuevo Rol
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="viewer">Visualizador</option>
                  <option value="operator">Operador</option>
                  <option value="esg_responsible">Responsable ESG</option>
                  <option value="auditor">Auditor</option>
                  <option value="certifier">Certificador</option>
                  <option value="admin">Administrador</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {getRoleDescription(newRole)}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleUpdateRole(editingUser.id, newRole)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

