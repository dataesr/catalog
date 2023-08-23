import { Icon, Tag, TagGroup } from '@dataesr/react-dsfr';
import { useEffect, useState } from 'react';

import CheckAvailability from './check-availibility';

const getNameFromLogin = (login) => {
  const logins = {
    'annelhote': 'Anne',
    'ericjeangirard': 'Eric',
    'folland87': 'Frédéric',
    'hfsllt': 'Hafsa',
    'jerem1508': 'Jérémy',
    'juliaGrandhay': 'Julia',
    'miarkt': 'Mialy',
    'Mihoub2': 'Mihoub',
    'poplingue': 'Pauline',
    'toutestprismemeca': 'Zoé',
    'yaca29': 'Yann',
  };
  return logins?.[login] ?? login;
};

const formatDate = (date) => {
  return date.slice(0, 10).split("-").reverse().join("/");
};

export default function SelectedTool({ tool }) {
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    async function fetchContributors() {
      try {
        const response = await fetch(`${import.meta.env.VITE_GITHUB_URL_CONTRIBUTORS.replace("/REPO/", `/${tool.name}/`)}repo=${tool.name}`);
        const body = await response.json();
        setContributors(Object.keys(body).map(key => body[key]));
      } catch (error) {
        console.error('Error while fetching contributors', error);
      }
    }
    fetchContributors();
  }, [tool]);

  return (
    <div className='fr-ml-2w'>
      {tool?.homepage && (
        <>
          <span className='fr-mr-1v'>
            Availability
          </span>
          <CheckAvailability url={tool?.homepage} />
        </>
      )}
      {tool?.staging && (
        <>
          <hr className='fr-my-2w fr-mx-1v' />
          <span className='fr-mr-1v'>
            Staging
          </span>
          <CheckAvailability url={tool?.staging} />
        </>
      )}
      {tool?.updated_at && (
        <>
          <hr className='fr-my-2w fr-mx-1v' />
          <Icon name='ri-history-line' />
          Updated {formatDate(tool.updated_at)}
        </>
      )}
      {contributors && (
        <>
          <hr className='fr-my-2w fr-mx-1v' />
          <span>
            Contributors
          </span>
          <TagGroup>
            {contributors.map((contributor) => (
              <Tag icon='ri-pencil-line' key={contributor.login}>
                {getNameFromLogin(contributor.login)}
              </Tag>
            ))}
          </TagGroup>
        </>
      )}
      {(tool?.topics?.length > 0) && (
        <>
          <hr className='fr-my-2w fr-mx-1v' />
          <span>
            Topics
          </span>
          <TagGroup>
            {tool.topics.filter((topic) => !!topic).map((topic, index) => (
              <Tag icon='ri-price-tag-3-line' key={index}>
                {topic}
              </Tag>
            ))}
          </TagGroup>
        </>
      )}
      {tool?.contact && (
        <>
          <hr className='fr-my-2w fr-mx-1v' />
          <span>
            Contact
          </span>
          <div>
            <Icon name='ri-mail-line' />
            {tool.contact}
          </div>
        </>
      )}
    </div>
  );
}
