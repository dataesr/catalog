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
  const [selectedLicenses, setSelectedLicenses] = useState(licenses.map((item) => item.key));
  const [selectedVisibility, setSelectedVisibility] = useState(visibility.map((item) => item.key));
  const [services, setServices] = useState(servicesData);
  const [tools, setTools] = useState([]);

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
      const repositories = await octokit.request(`GET /orgs/{org}/repos?sort=updated&page=${page}`, { org: 'dataesr' });
      const toolsTmp = repositories.data;
      if (toolsTmp.length === GITHUB_PER_PAGE) {
        fetchRepositories({ page: page + 1, allTools: [...allTools, ...toolsTmp] });
      } else {
        setTools([...allTools, ...toolsTmp]);
        setFilteredTools([...allTools, ...toolsTmp]);
      }
    }
    fetchRepositories({ page: 1, allTools: tools });
  }, []);

  useEffect(() => {
    setFilteredTools(tools.filter((item) =>
      selectedLicenses.includes(item?.license?.key ?? 'none')
      && selectedVisibility.includes(item?.private ? 'private' : 'public')
    ));
  }, [selectedLicenses, selectedVisibility]);

  return (
    <Container className="fr-my-15w">
      <Row>
        <Col n="2">
          <h2>
            Filtres
          </h2>
          <CheckboxGroup
            isInline
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
            isInline
            legend="Langage"
          >
            <Checkbox label="JavaScript" checked />
            <Checkbox label="Python" checked />
          </CheckboxGroup>
        </Col>
        <Col n="10">
          <Tabs>
            <Tab label="Catalogue">
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