import { useState, useEffect } from 'react';
import {
  ref,
  uploadBytesResumable,
  listAll,
  getDownloadURL,
  getMetadata,
} from 'firebase/storage';

import { storage } from './firebase-config';
import { Image, Progress, Spinner } from '@nextui-org/react';

const App = () => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsloading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    uploadFiles(selectedFiles);
  };

  const uploadFiles = (files) => {
    const promises = [];
    const storageRef = ref(storage, 'uploads');

    files.forEach((file, index) => {
      const fileRef = ref(storageRef, file.name);
      const uploadTask = uploadBytesResumable(fileRef, file);
      promises.push(uploadTask);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(
            (prevProgress) => (prevProgress + progress) / (index + 1)
          );
        },
        (error) => {
          console.error('Upload error:', error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadedFiles((prevFiles) => [
            ...prevFiles,
            { name: file.name, url: downloadURL },
          ]);
        }
      );
    });

    Promise.all(promises).then(() => setProgress(100));
  };

  useEffect(() => {
    const fetchUploadedFiles = async () => {
      const storageRef = ref(storage, 'uploads');
      setIsloading(true);
      const { items } = await listAll(storageRef);
      setIsloading(false);
      const promises = items.map(async (item) => {
        const metadata = await getMetadata(item);
        const downloadURL = await getDownloadURL(item);
        return {
          name: item.name,
          url: downloadURL,
          uploadedAt: metadata.timeCreated,
        };
      });
      const files = await Promise.all(promises);
      const sortedData = files.sort((a, b) => b.uploadedAt - a.uploadedAt);
      setUploadedFiles(sortedData);
    };
    fetchUploadedFiles();
  }, []);

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className='min-h-screen bg-[url("/public/background.jpg")]  bg-black py-10 text-white grid place-content-center'>
      <h1 className='text-center  italic text-4xl mb-4 font-bold font-dancing-script'>
        Titilope & Ayodele
      </h1>
      <div className='flex justify-center items-center'>
        <h2 className='mb-3 md:w-[450px] w-[85%] opacity-70  text-center'>
          We are truly grateful for your presence at our wedding. We would love
          for you to share your cherished memories with us by sending any photos
          or videos from the day. 😘{' '}
        </h2>
      </div>
      <div className='flex flex-col px-6 items-center mb-5 gap-2'>
        <div className='flex items-center justify-center md:w-[400px] w-full'>
          <label className='cursor-pointer flex flex-col rounded-lg border-1 border-dashed border-gray-500 w-full h-30 p-10 group text-center'>
            <div className='h-full w-full text-center flex flex-col items-center justify-center'>
              <p className='pointer-none text-gray-500 '>
                <span className='text-sm'>Drag and drop or </span>
                <span className='text-blue-600 hover:underline'>Browse</span>
              </p>
              <p className='text-gray-500 text-sm'>
                Supported formates: JPEG, PNG, GIF, MP4, MOV
              </p>
            </div>
            <input
              type='file'
              multiple
              accept='image/*,video/*'
              onChange={handleFileChange}
              className='hidden'
            />
          </label>
        </div>
        {progress > 0 && progress < 100 && (
          <Progress
            aria-label='Loading...'
            value={progress}
            className='max-w-xs h-2'
          />
        )}
      </div>

      {isLoading ? (
        <div className='grid m-4 place-content-center'>
          <Spinner />{' '}
        </div>
      ) : (
        <div className='flex p-4   md:max-w-screen-md w-full flex-wrap  gap-3'>
          {uploadedFiles.map((file, index) => (
            <div className='flex-shrink-0' key={index}>
              {file.url.includes('.mp4') ||
              file.url.includes('.mov') ||
              file.url.includes('.WebM') ? (
                <video
                  style={{
                    width: screenWidth < 768 ? screenWidth - 30 : '',
                  }}
                  className={`max-h-[250px] rounded-2xl w-full lg:w-[230px] object-cover `}
                  controls
                >
                  <source src={file.url} type='video/mp4' />
                </video>
              ) : (
                <>
                  <Image
                    isBlurred
                    isZoomed
                    width={screenWidth - 30}
                    loading='lazy'
                    classNames={{
                      img: `lg:w-[230px]  h-[250px]`,
                    }}
                    src={file.url}
                    alt={file.name}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
