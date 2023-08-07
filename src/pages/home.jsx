import {
  Card,
  CardDescription,
  CardTitle,
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

export default function Home() {
  const [services, setServices] = useState(servicesData);
  const [tools, setTools] = useState([]);

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
    async function fetchRepositories({ page }) {
      const octokit = new Octokit();
      const repositories = await octokit.request(`GET /orgs/{org}/repos?sort=updated&page=${page}`, {
        org: 'dataesr',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      const toolsTmp = repositories.data.map((tool) => ({
        ...tool,
        label: tool?.name,
        license: tool?.license?.name,
        tags: [tool?.language, ...tool?.topics],
        url: tool?.homepage,
      }));
      setTools([...tools, ...toolsTmp]);
      if (toolsTmp.length === GITHUB_PER_PAGE) {
        fetchRepositories({ page: page + 1 });
      }
    }
    fetchRepositories({ page: 1 });
  }, []);

  return (
    <Container className="fr-my-15w">
      <Tabs>
        <Tab label="Catalogue">
          {
            tools.map((tool) => (
              <Card
                href={tool?.url}
              >
                <CardTitle>
                  {tool.label}
                  {' '}
                  <Icon name={tool?.private ? 'ri-lock-unlock-line' : 'ri-lock-unlock-line'} />
                </CardTitle>
                <CardDescription>
                  {tool?.license && (
                    <div>
                      <Icon name='ri-scales-3-line' />
                      {tool.license}
                    </div>
                  )}
                  {tool?.description && (
                    <div>
                      <Icon name='ri-pen-nib-line' />
                      {tool.description}
                    </div>
                  )}
                  {tool?.tags && (
                    <TagGroup>
                      {tool.tags.filter((tag) => !!tag).map((tag) => (
                        <Tag icon='ri-price-tag-3-line'>
                          {tag}
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
    </Container>
  );
}