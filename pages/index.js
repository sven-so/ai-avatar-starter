import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
  const exampleArray = [
    "Closeup face portrait of svenso wearing crown of flowers, smooth soft skin, big dreamy eyes, intricate colored hair, symmetrical, anime wide eyes, soft lighting, detailed face, by makoto shinkai, stanley artgerm lau, wlop, rossdraws, concept art, digital painting, looking into camera",
    "Great lighting, portrait of svenso, in a solar punk setting highly detailed background",
    "Portrait photo of svenso, highly detailed, by karsh",
    "svenso intricate character portrait, intricate, beautiful, 8k resolution, dynamic lighting, hyperdetailed, quality 3D rendered, volumetric lighting, pixar, detailed background",
    "svenso as a character from disneys frozen, au naturel, PS2, PS1, hyper detailed, digital art, trending in artstation, cinematic lighting, studio quality, smooth render, unreal engine 5 rendered, octane rendered",
    "portrait of svenso as a 3d animated dwarf from lord of the rings, Ultra detailed, concept design, highly detailed, pincushion lens effect, 3d render",
    "portrait of svenso celebrating st.patricks day, Ultra detailed, concept design, highly detailed, pincushion lens effect, 3d render"
  ];
  const maxRetries = 20;
  const [input, setInput] = useState('');
  const [img, setImg] = useState('');
  const [example, setExample] = useState('');
  const [retry, setRetry] = useState(0);
  const [retryCount, setRetryCount] = useState(maxRetries);
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');
  const onChange = (event) => {
    setInput(event.target.value);
  };
  const showHelp = (event) => {
      setExample("Example Text: "+exampleArray[Math.floor(Math.random() * 6)]);
  }
  const generateAction = async () => {
    console.log('Generating...');
    if (isGenerating && retry === 0) return;
    setIsGenerating(true);
    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }
    const finalInput = input.replace('svenso', 'svsoenso man');
    console.log(finalInput);
    // Add the fetch request
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({ input: finalInput }),
    });

    const data = await response.json();
    if (response.status === 503) {
      setRetry(data.estimated_time);
      return;
    }

    // If another error, drop error
    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      setIsGenerating(false);
      return;
    }
    setFinalPrompt(input);
    setInput('');
    setImg(data.image);
    setIsGenerating(false);
  };
  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };
  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`);
        setRetryCount(maxRetries);
        return;
      }

      console.log(`Trying again in ${retry} seconds.`);

      await sleep(retry * 1000);

      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);
  return (
    <div className="root">
      <Head>
        <title>Make funny pictures of me | buildspace</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Make funny pictures of me</h1>
          </div>
          <div className="header-subtitle">
            <h2>just write into the first text field how you would like to see me and make sure to use "svenso" in the prompt</h2>
            {example && (<h2 className='example'>{example}</h2>)}
          </div>
          {/* Add prompt container here */}
          <div className="prompt-container">
            <a className='help-button' onClick={showHelp}>?</a>
            <input className="prompt-box" value={input} onChange={onChange} />
            <div className="prompt-buttons">
              <a className={
                isGenerating ? 'generate-button loading' : 'generate-button'
              } onClick={generateAction}>
                <div className="generate">
                  {isGenerating ? (
                    <span className="loader"></span>
                  ) : (
                    <p>Generate</p>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
        {img && (
          <div className="output-content">
            <Image src={img} width={512} height={512} alt={finalPrompt} />
            <p>{finalPrompt}</p>
          </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
