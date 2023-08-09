import { Card, CardDescription, Icon, Tag, TagGroup } from '@dataesr/react-dsfr';
import { Octokit } from '@octokit/core';
import { useEffect, useState } from 'react';

const { VITE_GIT_PAT } = import.meta.env;

const formatDate = (date) => {
  return date.slice(0, 10).split("-").reverse().join("/");
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

export default function ToolCard({ key, tool }) {
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    async function fetchAuthors() {
      const octokit = VITE_GIT_PAT ? new Octokit({ auth: VITE_GIT_PAT }) : new Octokit();
      const response = await octokit.request(`GET /repos/{org}/{repo}/contributors`, { org: 'dataesr', repo: tool.name });
      setContributors(response?.data ?? []);
    }
    fetchAuthors();
  }, []);

  return (
    <Card
      href={tool?.html_url}
      key={key}
    >
      <CardDescription>
        <div>
          {tool.name}
          {' '}
          <Icon name={tool?.private ? 'ri-lock-line' : 'ri-lock-unlock-line'} />
        </div>
        {tool?.description && (
          <div>
            <Icon name='ri-pen-nib-line' />
            {tool.description}
          </div>
        )}
        {tool?.license?.name && (
          <div>
            <Icon name='ri-scales-3-line' />
            {tool.license.name}
          </div>
        )}
        {tool?.language && (
          <div>
            <Icon name='ri-code-s-slash-line' />
            {tool.language}
          </div>
        )}
        {tool?.topics && (
          <TagGroup>
            {tool.topics.filter((topic) => !!topic).map((topic) => (
              <Tag icon='ri-price-tag-3-line'>
                {topic}
              </Tag>
            ))}
          </TagGroup>
        )}
        {tool?.contact && (
          <div>
            <Icon name='ri-mail-line' />
            {tool.contact}
          </div>
        )}
        {tool?.updated_at && (
          <div>
            <Icon name='ri-history-line' />
            Mis à jour le {formatDate(tool.updated_at)}
          </div>
        )}
        {contributors && (
          <TagGroup>
            {contributors.map((contributor) => (
              <Tag icon='ri-pencil-line'>
                {getNameFromLogin(contributor.login)}
              </Tag>
            ))}
          </TagGroup>
        )}
      </CardDescription>
    </Card>
  );
};
