import { useState, useEffect } from "react"

export default function Settings() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  )

  useEffect(() => {
    localStorage.setItem("theme", theme)
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white shadow rounded-xl p-6">

        <h2 className="text-xl font-bold mb-6">Settings</h2>

        <div className="flex justify-between items-center mb-4">
          <span>Dark Mode</span>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="px-4 py-1 rounded bg-gray-200"
          >
            {theme === "dark" ? "ON 🌙" : "OFF ☀️"}
          </button>
        </div>

        <p className="text-sm text-gray-500">
          More settings coming soon...
        </p>

      </div>
    </div>
  )
}