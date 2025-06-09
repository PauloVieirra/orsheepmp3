import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
  :root {
    --primary: #8B5CF6;
    --primary-dark: #7C3AED;
    --background:rgb(41, 41, 41);
    --surface:rgb(168, 47, 47);
    --text: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.7);
    --border: rgba(255, 255, 255, 0.1);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: var(--background);
    color: var(--text);
    line-height: 1.5;
  }

  button, input {
    font-family: inherit;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--primary-dark);
  }

  ::selection {
    background: var(--primary);
    color: white;
  }

  /* Estilos para links */
  a {
    color: var(--primary);
    text-decoration: none;
    transition: color 0.2s;
  }

  a:hover {
    color: var(--primary-dark);
  }

  /* Estilos para botões */
  button {
    cursor: pointer;
    transition: all 0.2s;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* Estilos para inputs */
  input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 8px 12px;
    border-radius: 4px;
    transition: all 0.2s;
  }

  input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
  }
`

export default GlobalStyles 