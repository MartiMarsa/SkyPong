import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { decodeConfig, isValidConfig } from '../../utils/configDecoder';

const GameLauncher = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const encodedConfig = searchParams.get('config');

    if (!encodedConfig) {
      navigate('/', { replace: true });
      return;
    }

    try {
      const config = decodeConfig(encodedConfig);

      if (!isValidConfig(config)) {
        navigate('/', { replace: true });
        return;
      }

      navigate('/canvas', { state: config, replace: true });
    } catch {
      navigate('/', { replace: true });
    }
  }, [location.search, navigate]);

  return null;
};

export default GameLauncher;
