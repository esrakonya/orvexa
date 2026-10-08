import { useState } from 'react'
import { getWorkspace, updateWorkspace } from '../services/workspaceService'

function SettingsPage() {
  const workspace = getWorkspace()

  const [name, setName] = useState(workspace.name)
  const [industry, setIndustry] = useState(workspace.industry ?? '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Workspace name is required.')
      setSuccess(false)
      return
    }

    updateWorkspace({
      name: trimmedName,
      industry,
    })

    setName(trimmedName)
    setIndustry(industry.trim())
    setError('')
    setSuccess(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your workspace information.
        </p>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Workspace Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Update the basic information of your workspace.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-xl space-y-5"
        >
          <div>
            <label
              htmlFor="workspace-name"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Workspace Name
            </label>

            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setError('')
                setSuccess(false)
              }}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label
              htmlFor="workspace-industry"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Industry
            </label>

            <input
              id="workspace-industry"
              type="text"
              value={industry}
              onChange={(event) => {
                setIndustry(event.target.value)
                setSuccess(false)
              }}
              placeholder="e.g. Digital Services"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-600">
              Workspace settings saved successfully.
            </p>
          )}

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Save Changes
          </button>
        </form>
      </section>
    </div>
  )
}

export default SettingsPage