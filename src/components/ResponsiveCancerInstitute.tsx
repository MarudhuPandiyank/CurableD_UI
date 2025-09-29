// src/components/ResponsiveCancerInstitute.tsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './ResponsiveCancerInstitute.css';
import { useNavigate } from 'react-router-dom';
import Header1 from './Header1';
import { useSelector } from 'react-redux';
import { selectMenus } from '../store/userSlice';
import { toRoute, normalize } from '../utils/routeMap'; // 👈 import normalize

const ResponsiveCancerInstitute: React.FC = () => {
  const navigate = useNavigate();
  const menus = useSelector(selectMenus);

  // hide the injected "Modify Patient Information" entry (/PatientEdit)
  const visibleMenus = (menus || []).filter(
    (m) =>
      m?.menu?.trim().toLowerCase() !== 'modify patient information' &&
      normalize(m?.url || '') !== normalize('/PatientEdit')
  );
                        console.log(visibleMenus,"Evaluation")

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      <Header1 showwidth />

      <main className="container4-fluid mt-4">
        <div className="container4-box d-flex flex-wrap justify-content-center">
          {visibleMenus.map((m) => (
            <div
              key={m.menu}
              className="box"
              onClick={() => navigate(toRoute(m.url))}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={`/HomeScreenIcons/PNG/${m.menu==="Clinical Evaluvation"?"Clinical Evaluvation"
                  :m.menu==="Clinical Evaluation"?"Clinical Evaluation"

                  : m.menu
                }.png`}
                onError={(e: any) => {
                  e.currentTarget.style.visibility = 'hidden';
                }}
                alt={m.menu}
                style={{ width: 50, height: 50, marginBottom: 10 }}
              />
              <div style={{ color: 'black' }}>{m.menu}</div>
            </div>
          ))}

          {visibleMenus.length === 0 && (
            <div style={{ color: '#666', padding: 16 }}>No menus available.</div>
          )}
        </div>
        <br/>
      </main>

        <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default ResponsiveCancerInstitute;
