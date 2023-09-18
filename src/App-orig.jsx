import React, { useEffect, useRef, useState, Suspense } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera, useProgress, PresentationControls } from '@react-three/drei';
import { EffectComposer, Vignette } from '@react-three/postprocessing';
import { PCFSoftShadowMap } from 'three';

import Loader from './Loader';
import NavMenu from './NavMenu';
import Model from './Model';

import pages from './assets/content/pages.json';
import envMap from './assets/img/environments/kloofendal_43d_clear_puresky_4k.hdr';

function Pages(props) {
  const location = useLocation();
  const { setCurrentPage } = props;
  useEffect(() => {
    const page = location.pathname.split('/')[1] || 'View1';
    setCurrentPage(page);
  }, [location, setCurrentPage]);
  return null;
}

function Camera(props) {
  const { camPosition, camTarget, currentPage } = props;
  const cameraRef = useRef();

  useEffect(() => {
    if (cameraRef.current && camTarget && camPosition) {
      // console.log(`camPosition: ${camPosition}`, `camTarget: ${camTarget}`);
      cameraRef.current.position.set(camPosition[0], camPosition[1], camPosition[2]);
      cameraRef.current.lookAt(camTarget[0], camTarget[1], camTarget[2]);
    }
  }, [camPosition, camTarget, currentPage]);

  return (
    <PerspectiveCamera
      makeDefault
      far={1100}
      near={0.1}
      fov={20}
      ref={cameraRef}
    />
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('View1');
  const [currentCamPosition, setCurrentCamPosition] = useState([0, 1.7, 2]);
  const [currentCamTarget, setCurrentCamTarget] = useState([0, 1.55, 0]);
  const canvasRef = useRef();
  const { active } = useProgress();
  console.log(active);

  useEffect(() => {
    if (!active && currentPage) {
      const { camPosition, camTarget } = pages.find((page) => page.url === currentPage);
      setCurrentCamPosition(camPosition);
      setCurrentCamTarget(camTarget);
      setIsLoaded(true);
    }
  }, [active, currentPage]);

  return (
    <Router>
      <div className="app">
        <Suspense fallback={<Loader />}>
          <Pages setCurrentPage={setCurrentPage} />
          <Canvas shadows={{ type: PCFSoftShadowMap }} dpr={1} ref={canvasRef}>
            <Camera
              camPosition={currentCamPosition}
              camTarget={currentCamTarget}
            />
            <EffectComposer>
              <directionalLight intensity={0.5} castShadow shadow-mapSize={1024 * 2} shadow-bias={0.000001} position={[0, 1.7, 0]} target-position={[0, 1.55, 0]} />
              <Vignette eskil={false} offset={0} darkness={0.9} />
              <Environment
                files={envMap}
                background
                exposure={1}
                blur={0}
              />
              <PresentationControls
                enabled
                global={false}
                cursor
                snap
                speed={8}
                zoom={1}
                polar={[0, 0.2]}
                azimuth={[-Infinity, Infinity]}
                config={{ mass: 1, tension: 170, friction: 26 }}
              ><Model />
              </PresentationControls>
            </EffectComposer>
          </Canvas>
          <NavMenu pageList={pages} currentPage={currentPage} />
        </Suspense>
      </div>
    </Router>
  );
}

export default App;