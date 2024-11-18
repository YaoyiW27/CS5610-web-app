import React, { Component } from 'react';
import Header from './components/Header';
import SearchBooks from './pages/SearchBooks';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <SearchBooks />
      </div>
    );
  }
}

export default App;