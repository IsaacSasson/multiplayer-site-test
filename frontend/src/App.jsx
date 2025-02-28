import { useEffect } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import Game from './components/Game';
import UsernameModal from './components/UsernameModal';

// Theme provider component to apply theme classes to the HTML element
const ThemeWrapper = ({ children }) => {
  const { currentTheme } = useGame();
  
  useEffect(() => {
    // Apply theme classes to the html element
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('theme-dark');
      document.documentElement.classList.remove('theme-default');
    } else {
      document.documentElement.classList.add('theme-default');
      document.documentElement.classList.remove('theme-dark');
    }
  }, [currentTheme]);
  
  return children;
};

function App() {
  return (
    <GameProvider>
      <ThemeWrapper>
        <Game />
        <UsernameModal />
      </ThemeWrapper>
    </GameProvider>
  );
}

export default App;