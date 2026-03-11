import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GuestPage from './GuestPage';
import RulesPage from './RulesPage';
import GamePage from './GamePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<GuestPage />} />
				<Route path="/rules" element={<RulesPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
			</Routes>
		</Router>
	);
}

export default App;