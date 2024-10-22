import { useEffect, useState } from 'react';

import { Alert } from '@/ui/core';
import { useLocalStorage } from '@/ui/hooks';
import { Icons } from '@/ui/icons';

const PachaChatBanner = () => {
  const [showBanner, setShowBanner] = useLocalStorage({
    key: 'Pacha:showPachaChatBannerCTA',
    defaultValue: true,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !showBanner) {
    return null;
  }

  return (
    <Alert
      icon={<Icons.Info size={20} />}
      title="Introducing PromptQL Playground"
      my={50}
      withCloseButton
      onClose={() => setShowBanner(false)}
      radius={'md'}
    >
      Connect realtime data to your AI {'  '}
      <a
        color="blue"
        style={{
          color: 'blue',
          textDecoration: 'underline',
          paddingLeft: 5,
        }}
        href="https://hasura.io/promptql"
        target="_blank"
      >
        Learn more →
      </a>
    </Alert>
  );
};

export default PachaChatBanner;
