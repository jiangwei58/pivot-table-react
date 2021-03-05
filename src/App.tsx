import React from 'react';
// import logo from './logo.svg';
import './App.css';
import PivotTable from './PivotTable';
import view from './simpleData/view.json';
import data from './simpleData/data.json';
import { PivotOptionType, ReportView } from './PivotTable/interface';

function App() {
  return (
    <div className="App">
      <div style={{display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#282c34'}}>
        <PivotTable 
          width={1024} 
          height={768}
          options={view as unknown as ReportView} 
          data={data as PivotOptionType} 
        />
      </div>
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </div>
  );
}

export default App;
