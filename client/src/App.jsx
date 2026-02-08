import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GuestPage from './GuestPage';
import RulesPage from './RulesPage';
import GamePage from './GamePage';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<GuestPage />} />
				<Route path="/rules" element={<RulesPage />} />
        <Route path="/game" element={<GamePage />} />
			</Routes>
		</Router>
	);
}

export default App;