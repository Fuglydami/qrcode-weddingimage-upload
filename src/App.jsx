import { Image, Progress, Spinner } from '@nextui-org/react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { useEffect, useState } from 'react';

// Cloudinary Configuration
const CLOUDINARY_UPLOAD_PRESET = 'wedding';
const CLOUDINARY_CLOUD_NAME = 'darwawl4l';
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

const imageCompressOptions = {
  maxSizeMB: 0.2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

const blobToFile = (blob, originalFile) => {
  return new File([blob], originalFile.name, {
    type: originalFile.type,
    lastModified: originalFile.lastModified,
  });
};

const App = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsloading] = useState(false);

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        const compressedBlob = await imageCompression(
          file,
          imageCompressOptions
        );
        return blobToFile(compressedBlob, file);
      })
    );

    uploadFiles(compressedFiles);
  };

  const uploadFiles = (files) => {
    const promises = files.map((file, index) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      return axios.post(CLOUDINARY_API_URL, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setProgress(
            (prevProgress) => (prevProgress + progress) / (index + 1)
          );
        },
      });
    });

    Promise.all(promises)
      .then((responses) => {
        const uploadedFiles = responses.map((response) => ({
          name: response.data.original_filename,
          url: response.data.secure_url,
          uploadedAt: response.data.created_at,
        }));
        setUploadedFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
        setProgress(100);
      })
      .catch((error) => {
        console.error('Upload error:', error);
      });
  };

  useEffect(() => {
    const fetchUploadedFiles = async () => {
      setIsloading(true);
      // Fetch previously uploaded files from Cloudinary if necessary
      // This requires keeping track of uploaded files, e.g., in a database.
      // Skipping the implementation here for simplicity.
      setIsloading(false);
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
          from the day. 😘{' '}
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
                Supported formats: JPEG, PNG, GIF
              </p>
            </div>
            <input
              type='file'
              multiple
              accept='image/*'
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
