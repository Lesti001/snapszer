import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GuestPage from './GuestPage';
import RulesPage from './RulesPage';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<GuestPage />} />
				<Route path="/rules" element={<RulesPage />} />
			</Routes>
		</Router>
	);
}

export default App;