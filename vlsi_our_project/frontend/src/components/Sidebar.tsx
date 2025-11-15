import React, { useMemo, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import {
  User,
  History,
  Save,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FolderPlus,
  FilePlus,
  HardDrive,
  Trash2,
  Map,
} from "lucide-react"
import type { Project } from "./ProjectManagerModal"

interface SidebarProps {
  onSaveCode?: () => void
  onLoadHistory?: () => void
  onOpenSettings?: () => void
  projects: Project[]
  activeProjectId: string | null
  activeFileId: string | null
  onSelectProject: (projectId: string) => void
  onSelectFile: (projectId: string, fileId: string) => void
  onCreateProject: (name: string) => void
  onCreateFile: (projectId: string, fileName: string) => void
  onDeleteProject: (projectId: string) => void
  onDeleteFile: (projectId: string, fileId: string) => void
  onSaveWorkspace: () => void
  unsavedWorkspace: boolean
  expandedWidth: number
  collapsedWidth?: number
  isCollapsed: boolean
  onToggleCollapsed: (collapsed: boolean) => void
  onWidthChange: (width: number) => void
  onOpenMentorship: () => void
}

const MIN_WIDTH = 240
const MAX_WIDTH = 420

const Sidebar: React.FC<SidebarProps> = ({
  onSaveCode,
  onLoadHistory,
  onOpenSettings,
  projects,
  activeProjectId,
  activeFileId,
  onSelectProject,
  onSelectFile,
  onCreateProject,
  onCreateFile,
  onDeleteProject,
  onDeleteFile,
  onSaveWorkspace,
  unsavedWorkspace,
  expandedWidth,
  collapsedWidth = 64,
  isCollapsed,
  onToggleCollapsed,
  onWidthChange,
  onOpenMentorship,
}) => {
  const { user, logout } = useAuth()
  const [newProjectName, setNewProjectName] = useState("")
  const [newFileName, setNewFileName] = useState("")

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  )

  const width = isCollapsed ? collapsedWidth : expandedWidth

  const handleCreateProject = () => {
    const trimmed = newProjectName.trim()
    if (!trimmed) return
    onCreateProject(trimmed)
    setNewProjectName("")
  }

  const handleCreateFile = () => {
    if (!activeProject) return
    const trimmed = newFileName.trim()
    if (!trimmed) return
    onCreateFile(activeProject.id, trimmed)
    setNewFileName("")
  }

  const handleResizePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isCollapsed) return
    event.preventDefault()
    event.stopPropagation()

    const startX = event.clientX
    const startWidth = width

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX
      const nextWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + delta))
      onWidthChange(nextWidth)
    }

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
  }

  const handleToggleCollapsed = () => {
    onToggleCollapsed(!isCollapsed)
  }

  if (!user) {
    return null
  }

  return (
    <aside
      className="relative bg-slate-800 border-r border-slate-700 transition-[width] duration-300 flex flex-col flex-shrink-0"
      style={{ width }}
    >
      <button
        onClick={handleToggleCollapsed}
        className="absolute -right-3 top-6 bg-slate-700 hover:bg-slate-600 text-white rounded-full p-1 border border-slate-600 z-30"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name ?? "User avatar"}
              className="w-10 h-10 rounded-full border-2 border-primary-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          )}

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">{user.name}</h3>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onLoadHistory?.()}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
              title="Code History"
            >
              <History size={20} />
              {!isCollapsed && <span>History</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => onSaveCode?.()}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
              title="Save Code"
            >
              <Save size={20} />
              {!isCollapsed && <span>Save Code</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => onOpenSettings?.()}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
              title="Settings"
            >
              <Settings size={20} />
              {!isCollapsed && <span>Settings</span>}
            </button>
          </li>
          <li>
            <button
              onClick={onOpenMentorship}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
              title="VLSI Mentorship Roadmap"
            >
              <Map size={20} />
              {!isCollapsed && <span>VLSI Mentorship</span>}
            </button>
          </li>
        </ul>

        {!isCollapsed && (
          <div className="mt-6 space-y-4">
            <section>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-300">
                <span>Projects</span>
                <button
                  onClick={handleCreateProject}
                  className="flex items-center gap-1 text-primary-300 hover:text-primary-200 transition-colors"
                  title="Create project"
                >
                  <FolderPlus size={14} />
                  Add
                </button>
              </div>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto pr-1">
                {projects.length === 0 && (
                  <p className="text-xs text-slate-500">No projects yet. Add one above.</p>
                )}
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className={`group relative w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      project.id === activeProjectId
                        ? 'border-primary-500 bg-primary-500/20 text-white'
                        : 'border-slate-700 bg-slate-900 hover:border-primary-400/70 hover:bg-slate-700/60 text-slate-300'
                    }`}
                  >
                    <span className="truncate">{project.name}</span>
                    <span className="ml-2 text-[10px] text-slate-400">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          onDeleteProject(project.id)
                        }}
                        className="flex items-center justify-center rounded-full bg-red-500/20 text-red-200 hover:bg-red-500/40 p-1"
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(event) => setNewProjectName(event.target.value)}
                  placeholder="New project name"
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-300">
                <span>Files</span>
                <button
                  onClick={handleCreateFile}
                  className="flex items-center gap-1 text-primary-300 hover:text-primary-200 transition-colors disabled:text-slate-600"
                  title="Add file"
                  disabled={!activeProject}
                >
                  <FilePlus size={14} />
                  Add
                </button>
              </div>
              {activeProject ? (
                <>
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto pr-1">
                    {activeProject.files.length === 0 && (
                      <p className="text-xs text-slate-500">No files yet. Add one below.</p>
                    )}
                    {activeProject.files.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => onSelectFile(activeProject.id, file.id)}
                        className={`group relative w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          file.id === activeFileId
                            ? 'border-primary-500 bg-primary-500/20 text-white'
                            : 'border-slate-700 bg-slate-900 hover:border-primary-400/70 hover:bg-slate-700/60 text-slate-300'
                        }`}
                        title={file.name}
                      >
                        <span className="flex-1 truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {file.content.length > 0 ? `${file.content.length} ch` : 'Empty'}
                        </span>
                        <span className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              onDeleteFile(activeProject.id, file.id)
                            }}
                            className="flex items-center justify-center rounded-full bg-red-500/20 text-red-200 hover:bg-red-500/40 p-1"
                            title="Delete file"
                          >
                            <Trash2 size={14} />
                          </button>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(event) => setNewFileName(event.target.value)}
                      placeholder="New file name"
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                    />
                  </div>
                </>
              ) : (
                <p className="mt-2 text-xs text-slate-500">Select a project to view its files.</p>
              )}
            </section>

            <button
              onClick={onSaveWorkspace}
              className={[
                'flex',
                'w-full',
                'items-center',
                'justify-center',
                'gap-2',
                'rounded-lg',
                'border',
                'px-3',
                'py-2',
                'text-sm',
                'font-medium',
                'transition-colors',
                unsavedWorkspace
                  ? 'border-yellow-500 bg-yellow-500/20 text-yellow-100 hover:bg-yellow-500/30'
                  : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-primary-400/70 hover:bg-slate-700/60',
              ].join(' ')}
              title="Save all projects to workspace"
            >
              <HardDrive size={16} />
              Save workspace
            </button>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {!isCollapsed && (
        <div
          className="absolute top-0 right-0 h-full w-1 cursor-col-resize bg-transparent"
          onPointerDown={handleResizePointerDown}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
        />
      )}
    </aside>
  )
}

export default Sidebar
