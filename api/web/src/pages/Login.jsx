export default function Login() {
  return (
    <div className="min-h-dvh grid place-items-center bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-sm text-center">
        <h2 className="text-2xl font-semibold mb-6">Connexion</h2>
        <a href="/api/auth/login" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 hover:bg-indigo-500">
          <svg width="20" height="20" viewBox="0 0 127.14 96.36" aria-hidden="true" className="opacity-90">
            <path fill="currentColor" d="M107.7 8.07A105.15 105.15 0 0081.5 0a72.06 72.06 0 00-3.36 6.87 97.68 97.68 0 00-29.14 0A72.86 72.86 0 0045.64 0 105.89 105.89 0 0019.39 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0032.39 16.15 77.7 77.7 0 006.92-11.19 68.42 68.42 0 01-10.9-5.19c.92-.67 1.82-1.39 2.68-2.13a49.35 49.35 0 0048.92 0c.86.76 1.76 1.47 2.68 2.13a68.68 68.68 0 01-10.93 5.2 77.34 77.34 0 006.92 11.19A105.25 105.25 0 00126.6 80.2c2.67-27.62-4.57-51.4-18.9-72.13zM42.45 65.69c-6.17 0-11.23-5.66-11.23-12.63s4.94-12.63 11.23-12.63S53.7 45.09 53.7 53.06s-4.93 12.63-11.23 12.63zm42.24 0c-6.17 0-11.23-5.66-11.23-12.63S78.4 40.44 84.69 40.44 95.92 46.1 95.92 53.06s-5.04 12.63-11.23 12.63z"/>
          </svg>
          Se connecter avec Discord
        </a>
        <p className="mt-3 text-xs text-zinc-400">Tu seras redirigé vers Discord (scope: identify).</p>
      </div>
    </div>
  )
}
