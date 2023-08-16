import {
  Checkbox,
  CheckboxGroup,
  Col,
  Container,
  Row,
} from '@dataesr/react-dsfr';
import { Octokit } from '@octokit/core';
import { useEffect, useState } from 'react';

import SelectedTool from '../components/selected-tool';
import { Spinner } from '../components/spinner';
import ToolCard from '../components/tool-card';
import metaData from '../data/meta.json';

const { VITE_GIT_PAT, VITE_PRIVATE_METADATA } = import.meta.env;

// 5 minutes
const GITHUB_PER_PAGE = 30;

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
  const [selectedTool, setSelectedTool] = useState();
  const [selectedVisibility, setSelectedVisibility] = useState(visibility.map((item) => item.key));
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
    async function fetchRepositories({ page, allTools }) {
      const metaDataPrivate = VITE_PRIVATE_METADATA ? await import(/* @vite-ignore */VITE_PRIVATE_METADATA) : {};
      const octokit = VITE_GIT_PAT ? new Octokit({ auth: VITE_GIT_PAT }) : new Octokit();
      const repositories = await octokit.request(`GET /orgs/{org}/repos?sort=updated_at&page=${page}`, { org: 'dataesr' });
      const toolsTmp = repositories.data.map((item) => ({ ...item, ...metaData?.[item.name], ...metaDataPrivate?.[item.name] }));
      if (toolsTmp.length === GITHUB_PER_PAGE) {
        fetchRepositories({ page: page + 1, allTools: [...allTools, ...toolsTmp] });
      } else {
        setTools([...allTools, ...toolsTmp]);
        setFilteredTools([...allTools, ...toolsTmp]);
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
        <Col n="3">
          <h2>
            Filtres
          </h2>
          <span>
            <i>
              {`${filteredTools.length}/${tools.length} projets`}
            </i>
          </span>
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
        <Col n="5">
          {(filteredTools.length > 0) ? (
            <div>
              {
                filteredTools.map((tool) => (
                  <ToolCard setSelectedTool={setSelectedTool} tool={tool} />
                ))
              }
            </div>
          ) : <Spinner />}
        </Col>
        {selectedTool && (
          <Col n="4">
            <SelectedTool tool={selectedTool} />
          </Col>
        )}
      </Row>
    </Container>
  );
}