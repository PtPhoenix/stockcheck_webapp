import { useTheme } from '../state/theme.jsx'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button type="button" className="ghost" onClick={toggleTheme}>
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  )
}

export default ThemeToggle
