import './App.css';
import QRCode from 'qrcode.react';

function App() {
  const websiteUrl = 'https://qrcode-weddingimage-upload.vercel.app/';
  return (
    <main className='bg-black min-h-screen grid place-content-center text-white'>
      <QRCode size={300} value={websiteUrl} />
    </main>
  );
}

export default App;
