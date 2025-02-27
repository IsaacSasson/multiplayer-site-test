import { GameProvider } from './contexts/GameContext';
import Game from './components/Game';
import UsernameModal from './components/UsernameModal';

function App() {
  return (
    <GameProvider>
      <Game />
      <UsernameModal />
    </GameProvider>
  );
}

export default App;