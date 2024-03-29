import './App.css';
import QRCode from 'qrcode.react';

function App() {
  const websiteUrl = 'https://ayodele-weds-titilope.vercel.app/';
  return (
    <main className='bg-white min-h-screen grid place-content-center '>
      <QRCode size={300} value={websiteUrl} />
    </main>
  );
}

export default App;
