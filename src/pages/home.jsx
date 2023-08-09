import {
  Card,
  CardDescription,
  CardTitle,
  Checkbox,
  CheckboxGroup,
  Col,
  Container,
  Icon,
  Row,
  Tab,
  Tabs,
  Tag,
  TagGroup,
} from '@dataesr/react-dsfr';
import { Octokit } from "@octokit/core";
import { useEffect, useState } from 'react';

import servicesData from '../data/services.json';
import metaData from '../data/meta.json';

const { VITE_GIT_PAT } = import.meta.env;

// 5 minutes
const GITHUB_PER_PAGE = 30;
const REFRESH_INTERVAL = 300000;

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

const checkStatus = async (url, urlOptions) => {
  try {
    const options = urlOptions ?? {};
    const result = await fetch(url, options);
    return { ok: result.ok, status: result.status };
  } catch (err) {
    return { ok: false, status: err.message };
  }
}

const formatDate = (date) => {
  return date.slice(0, 10).split("-").reverse().join("/");
}

const languages = [
  { key: 'JavaScript', label: 'JavaScript' },
  { key: 'Python', label: 'Python' },
  { key: 'Dockerfile', label: 'Dockerfile' },
  { key: 'Shell', label: 'Shell' },
  { key: 'Jupyter Notebook', label: 'Jupyter Notebook' },
  { key: 'SAS', label: 'SAS' },
  { key: 'Jsonnet', label: 'Jsonnet' },
  { key: 'R', label: 'R' },
  { key: 'HTML', label: 'HTML' },
  { key: 'Java', label: 'Java' },
  { key: 'Vue', label: 'Vue' },
  { key: 'none', label: 'Aucune' },
];

const licenses = [
  { key: 'mit', label: 'MIT License' },
  { key: 'gpl-2.0', label: 'GNU General Public License v2.0' },
  { key: 'gpl-3.0', label: 'GNU General Public License v3.0' },
  { key: 'none', label: 'Aucune' },
];

const visibility = [
  { key: 'public', label: 'Public' },
  { key: 'private', label: 'Privé' },
];

export default function Home() {
  const [filteredTools, setFilteredTools] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState(languages.map((item) => item.key));
  const [selectedLicenses, setSelectedLicenses] = useState(licenses.map((item) => item.key));
  const [selectedVisibility, setSelectedVisibility] = useState(visibility.map((item) => item.key));
  const [services, setServices] = useState(servicesData);
  const [tools, setTools] = useState([]);

  const onLanguagesChange = (itemKey) => {
    if (selectedLanguages.includes(itemKey)) {
      const selectedLanguagesCopy = [...selectedLanguages].filter((item) => item !== itemKey);
      setSelectedLanguages(selectedLanguagesCopy);
    } else {
      setSelectedLanguages([...selectedLanguages, itemKey])
    }
  };

  const onLicensesChange = (itemKey) => {
    if (selectedLicenses.includes(itemKey)) {
      const selectedLicensesCopy = [...selectedLicenses].filter((item) => item !== itemKey);
      setSelectedLicenses(selectedLicensesCopy);
    } else {
      setSelectedLicenses([...selectedLicenses, itemKey])
    }
  };

  const onVisibilityChange = (itemKey) => {
    if (selectedVisibility.includes(itemKey)) {
      const selectedVisibilityCopy = [...selectedVisibility].filter((item) => item !== itemKey);
      setSelectedVisibility(selectedVisibilityCopy);
    } else {
      setSelectedVisibility([...selectedVisibility, itemKey])
    }
  };

  useEffect(() => {
    async function fetchData() {
      const servicesCopy = [...services];
      const responses = await Promise.all(servicesCopy.map((service) => checkStatus(service.url, service?.urlOptions)));
      responses.forEach((response, index) => {
        servicesCopy[index].ok = response.ok ? 'ok' : 'ko';
        servicesCopy[index].status = response.status;
      })
      setServices(servicesCopy);
    }
    fetchData();
    setInterval(fetchData, REFRESH_INTERVAL);
  }, [])

  useEffect(() => {
    async function fetchRepositories({ page, allTools }) {
      const octokit = VITE_GIT_PAT ? new Octokit({ auth: VITE_GIT_PAT }) : new Octokit();
      const repositories = await octokit.request(`GET /orgs/{org}/repos?sort=updated_at&page=${page}`, { org: 'dataesr' });
      const toolsTmp = repositories.data.map((item) => metaData?.[item.name] ? { ...item, ...metaData[item.name] } : item);
      if (toolsTmp.length === GITHUB_PER_PAGE) {
        fetchRepositories({ page: page + 1, allTools: [...allTools, ...toolsTmp] });
      } else {
        const allToolsTmp = [...allTools, ...toolsTmp];
        console.log(allToolsTmp.map((item) => item.authors));
        setTools(allToolsTmp);
        setFilteredTools(allToolsTmp);
      }
    }
    fetchRepositories({ page: 1, allTools: [] });
  }, []);

  useEffect(() => {
    setFilteredTools(tools.filter((item) =>
      selectedLanguages.includes(item?.language ?? 'none')
      && selectedLicenses.includes(item?.license?.key ?? 'none')
      && selectedVisibility.includes(item?.private ? 'private' : 'public')
    ));
  }, [selectedLanguages, selectedLicenses, selectedVisibility]);

  return (
    <Container className="fr-my-15w">
      <Row>
        <Col n="2">
          <h2>
            Filtres
          </h2>
          <CheckboxGroup
            legend="Visibilité"
          >
            {
              visibility.map((item) => (
                <Checkbox
                  checked={selectedVisibility.includes(item.key)}
                  key={item.key}
                  label={item.label}
                  onChange={() => onVisibilityChange(item.key)}
                />
              ))
            }
          </CheckboxGroup>
          <CheckboxGroup
            legend="Licences"
          >
            {
              licenses.map((item) => (
                <Checkbox
                  checked={selectedLicenses.includes(item.key)}
                  key={item.key}
                  label={item.label}
                  onChange={() => onLicensesChange(item.key)}
                />
              ))
            }
          </CheckboxGroup>
          <CheckboxGroup
            legend="Langage"
          >
            {
              languages.map((item) => (
                <Checkbox
                  checked={selectedLanguages.includes(item.key)}
                  key={item.key}
                  label={item.label}
                  onChange={() => onLanguagesChange(item.key)}
                />
              ))
            }
          </CheckboxGroup>
        </Col>
        <Col n="10">
          <Tabs>
            <Tab label={`Catalogue (${filteredTools.length})`}>
              {
                filteredTools.map((tool) => (
                  <Card
                    href={tool?.html_url}
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
                    </CardDescription>
                  </Card>
                ))
              }
            </Tab>
            <Tab label="Disponibilité">
              <Row>
                {
                  services.map((service) => (
                    <Col n="6">
                      <Card
                        href={service.url}
                        key={service.id}
                        onClick={() => { }}>
                        <CardTitle>
                          <div>
                            {service.label}
                          </div>
                          {service.ok === 'ko' && (
                            <div >
                              {service.status}
                            </div>
                          )}
                          <Icon name={getIconByStatus(service.ok)} color={getColorByStatus(service.ok)} />
                        </CardTitle>
                      </Card>
                    </Col>
                  ))
                }
              </Row>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}