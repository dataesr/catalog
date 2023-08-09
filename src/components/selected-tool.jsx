import { Icon, Tag, TagGroup } from '@dataesr/react-dsfr';
import { Octokit } from '@octokit/core';
import { useEffect, useState } from 'react';

const { VITE_GIT_PAT } = import.meta.env;

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
  const [status, setStatus] = useState('undecided');

  useEffect(() => {
    async function fetchContributors() {
      const octokit = VITE_GIT_PAT ? new Octokit({ auth: VITE_GIT_PAT }) : new Octokit();
      const response = await octokit.request(`GET /repos/{org}/{repo}/contributors`, { org: 'dataesr', repo: tool.name });
      setContributors(response?.data ?? []);
    }
    fetchContributors();
  }, [tool]);

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
    checkStatus(tool?.homepage);
  }, [tool]);

  return (
    <div>
      {tool?.homepage && (
        <>
          <span>
            Disponibilité
          </span>
          <Icon name={getIconByStatus(status)} color={getColorByStatus(status)} className='float-right' />
        </>
      )}
      {tool?.updated_at && (
        <>
          <hr className="fr-my-2w fr-mx-1v" />
          <Icon name='ri-history-line' />
          Mis à jour le {formatDate(tool.updated_at)}
        </>
      )}
      {contributors && (
        <>
          <hr className="fr-my-2w fr-mx-1v" />
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
          <hr className="fr-my-2w fr-mx-1v" />
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
          <hr className="fr-my-2w fr-mx-1v" />
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
