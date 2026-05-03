'use client'

import { useState } from 'react'
import { createDocumentType, deleteDocumentType, updateUserRole } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { useRealtimeDocumentTypes } from '@/lib/hooks'
import { useToast } from '@/app/components/ToastProvider'
import { ConfirmModal } from '@/app/components/ConfirmModal'

type Role = 'admin' | 'accountant' | 'viewer'

const roleConfig: Record<Role, { label: string; color: string; bg: string }> = {
  admin: { label: 'Administrator', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  accountant: { label: 'Accountant', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
  viewer: { label: 'Viewer', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
}

export default function SettingsClient({
  initialTypes,
  initialProfiles,
  currentUserId,
}: {
  initialTypes: any[]
  initialProfiles: any[]
  currentUserId: string
}) {
  const router = useRouter()
  const toast = useToast()
  useRealtimeDocumentTypes()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingTypeId, setDeletingTypeId] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'taxonomy' | 'users'>('taxonomy')

  // ---- Document Types ----
  const handleCreateType = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createDocumentType(formData)
      ;(e.target as HTMLFormElement).reset()
      router.refresh()
      toast('Document category created', 'success')
    } catch (error: any) {
      toast(error?.message || 'Failed to create category', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTypeConfirm = async () => {
    if (!deletingTypeId) return
    try {
      await deleteDocumentType(deletingTypeId)
      setDeletingTypeId(null)
      router.refresh()
      toast('Category removed', 'success')
    } catch (error: any) {
      toast(error?.message || 'Failed to delete category', 'error')
      setDeletingTypeId(null)
    }
  }

  // ---- User Management ----
  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (userId === currentUserId) {
      toast('You cannot change your own role', 'warning')
      return
    }
    setUpdatingUserId(userId)
    try {
      await updateUserRole(userId, newRole)
      router.refresh()
      toast('User role updated successfully', 'success')
    } catch (error: any) {
      toast(error?.message || 'Failed to update role', 'error')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const tabs = [
    { id: 'taxonomy' as const, label: 'Document Taxonomy', icon: 'category' },
    { id: 'users' as const, label: 'User Management', icon: 'manage_accounts' },
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`settings-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-primary dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-sm" style={activeTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ---- Taxonomy Tab ---- */}
      {activeTab === 'taxonomy' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary dark:text-blue-400 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                category
              </span>
              <div>
                <h3 className="text-lg font-semibold font-headline text-slate-900 dark:text-slate-100">
                  Document Taxonomy
                </h3>
                <p className="text-sm text-slate-500">
                  Define classification categories for assets across all clients.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start overflow-x-auto">
            {/* Active Categories */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold font-label text-slate-400 uppercase tracking-widest">
                Active Categories ({initialTypes.length})
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {initialTypes.length === 0 ? (
                  <p className="text-sm text-slate-500 italic p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    No custom categories defined.
                  </p>
                ) : (
                  initialTypes.map((t: any) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-primary dark:bg-blue-400" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.name}</span>
                      </div>
                      <button
                        id={`delete-type-${t.id}`}
                        onClick={() => setDeletingTypeId(t.id)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add New */}
            <div className="bg-slate-50 dark:bg-slate-800/20 p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <h4 className="text-sm font-bold font-label text-slate-500 uppercase tracking-widest mb-4">
                Register New Category
              </h4>
              <form onSubmit={handleCreateType} className="space-y-4">
                <input
                  required
                  name="name"
                  id="new-category-input"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none"
                  type="text"
                  placeholder="e.g. Identity Documents, Board Minutes..."
                />
                <button
                  id="add-category-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:opacity-90 text-white px-4 py-3 rounded-lg font-bold shadow-sm transition-opacity disabled:opacity-50 text-sm flex justify-center items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  {isSubmitting ? 'Registering...' : 'Add Category'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---- User Management Tab ---- */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary dark:text-blue-400 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                manage_accounts
              </span>
              <div>
                <h3 className="text-lg font-semibold font-headline text-slate-900 dark:text-slate-100">
                  User Management
                </h3>
                <p className="text-sm text-slate-500">
                  Control role-based access for all registered users.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
            {initialProfiles.length === 0 ? (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 block mb-3">
                  group_off
                </span>
                <p className="text-slate-500">No users found.</p>
              </div>
            ) : (
              initialProfiles.map((profile: any) => {
                const cfg = roleConfig[profile.role as Role] || roleConfig.viewer
                const isCurrentUser = profile.id === currentUserId
                const isUpdating = updatingUserId === profile.id
                const initials = (profile.full_name || profile.email || 'U')
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <div key={profile.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors min-w-max sm:min-w-0">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center border border-blue-200 dark:border-blue-800 text-sm flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {profile.full_name || 'Unnamed User'}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded flex-shrink-0">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{profile.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 flex-wrap sm:flex-nowrap justify-start sm:justify-end sm:ml-4 w-full sm:w-auto">
                      {/* Current role badge */}
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>

                      {/* Role selector — disabled for self */}
                      {!isCurrentUser && (
                        <div className="relative flex-shrink-0">
                          <select
                            id={`role-select-${profile.id}`}
                            value={profile.role}
                            disabled={isUpdating}
                            onChange={(e) => handleRoleChange(profile.id, e.target.value as Role)}
                            className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="accountant">Accountant</option>
                            <option value="admin">Admin</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">
                            {isUpdating ? 'progress_activity' : 'expand_more'}
                          </span>
                        </div>
                      )}

                      {isCurrentUser && (
                        <span className="text-xs text-slate-400 italic flex-shrink-0 whitespace-nowrap">Cannot modify</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer info */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              info
            </span>
            <p className="text-xs text-slate-500">
              Role changes take effect immediately. Admins can access all system features.
            </p>
          </div>
        </div>
      )}

      {/* Delete Category Confirm */}
      {deletingTypeId && (
        <ConfirmModal
          title="Remove Category"
          message="Documents with this category will become uncategorized. This cannot be undone."
          confirmLabel="Yes, Remove"
          cancelLabel="Cancel"
          destructive
          onConfirm={handleDeleteTypeConfirm}
          onCancel={() => setDeletingTypeId(null)}
        />
      )}
    </div>
  )
}
