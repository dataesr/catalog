import { Icon, Link } from '@dataesr/react-dsfr';
import { useEffect, useState } from 'react';

const getColorByStatus = (status) => {
  switch (status) {
    case 'ok':
      return 'green';
    case 'ko':
      return 'red';
    default:
      return 'gray';
  }
};

const getIconByStatus = (status) => {
  switch (status) {
    case 'ok':
      return 'ri-check-line';
    case 'ko':
      return 'ri-close-line';
    default:
      return 'ri-question-mark';
  }
};

export default function CheckAvailability({ url }) {
  const [status, setStatus] = useState('undecided');

  useEffect(() => {
    async function checkStatus(url) {
      if (url) {
        try {
          const result = await fetch(url);
          setStatus(result.ok ? 'ok' : 'ko')
        } catch (err) {
          setStatus('ko');
        }
      }
    }
    checkStatus(url);
  }, []);

  return (
    <div>
      <Link href={url} target='_blank'>
        {url}
      </Link>
      <Icon name={getIconByStatus(status)} color={getColorByStatus(status)} />
    </div>
  );
}
