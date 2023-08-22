import { Icon, Tag, TagGroup } from '@dataesr/react-dsfr';
import { Octokit } from '@octokit/core';
import { useEffect, useState } from 'react';

import CheckAvailability from './check-availibility';

const { VITE_GIT_PAT } = import.meta.env;

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
      const octokit = VITE_GIT_PAT ? new Octokit({ auth: VITE_GIT_PAT }) : new Octokit();
      const response = await octokit.request(`GET /repos/{org}/{repo}/contributors`, { org: 'dataesr', repo: tool.name });
      setContributors(response?.data ?? []);
    }
    fetchContributors();
  }, [tool]);

  return (
    <div className='fr-ml-2w'>
      {tool?.homepage && (
        <>
          <span className='fr-mr-1v'>
            Disponibilité
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
          Mis à jour le {formatDate(tool.updated_at)}
        </>
      )}
      {contributors && (
        <>
          <hr className='fr-my-2w fr-mx-1v' />
          <span>
            Contributeurs
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
            Thèmes
          </span>
          <TagGroup>
            {tool.topics.filter((topic) => !!topic).map((topic) => (
              <Tag icon='ri-price-tag-3-line'>
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
