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

const FALLBACK_CHECKBOX_LABEL = 'Aucun';
const GITHUB_PER_PAGE = 30;

const normalize = (str) => str
  .toLowerCase()
  .normalize('NFD')
  .replace(/[^a-zA-Z0-9]/g, '');

export default function Home() {
  const [filteredTools, setFilteredTools] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedLicenses, setSelectedLicenses] = useState([]);
  const [selectedTool, setSelectedTool] = useState();
  const [selectedVisibility, setSelectedVisibility] = useState([]);
  const [tools, setTools] = useState([]);
  const [visibility, setVisibility] = useState([]);

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
      let metaDataPrivate = {};
      try {
        metaDataPrivate = VITE_PRIVATE_METADATA ? await import(/* @vite-ignore */VITE_PRIVATE_METADATA) : {};
      } catch (error) {}
      const octokit = VITE_GIT_PAT ? new Octokit({ auth: VITE_GIT_PAT }) : new Octokit();
      const repositories = await octokit.request(`GET /orgs/{org}/repos?sort=updated_at&page=${page}`, { org: 'dataesr' });
      const toolsTmp = repositories.data.map((item) => ({ ...item, ...metaData?.[item.name], ...metaDataPrivate?.[item.name] }));
      if (toolsTmp.length === GITHUB_PER_PAGE) {
        fetchRepositories({ page: page + 1, allTools: [...allTools, ...toolsTmp] });
      } else {
        setTools([...allTools, ...toolsTmp]);
      }
    }
    fetchRepositories({ page: 1, allTools: [] });
  }, []);

  useEffect(() => {
    const allLanguages = {};
    const allLicenses = {};
    const allVisibility = {
      private: { key: 'private', label: 'Privé', count: 0 },
      public: { key: 'public', label: 'Public', count: 0 },
    };
    tools.forEach((tool) => {
      const language = tool?.language ?? FALLBACK_CHECKBOX_LABEL;
      if (!allLanguages?.[normalize(language)]) allLanguages[normalize(language)] = { key: normalize(language), label: language, count: 0 };
      allLanguages[normalize(language)].count += 1;
      const license = tool?.license ? tool.license : { key: normalize(FALLBACK_CHECKBOX_LABEL), name: FALLBACK_CHECKBOX_LABEL };
      if (!allLicenses?.[license.key]) allLicenses[license.key] = { key: license.key, label: license.name, count: 0 };
      allLicenses[license.key].count += 1;
      tool?.private ? allVisibility.private.count += 1 : allVisibility.public.count += 1;
    });
    setLanguages(Object.values(allLanguages).sort((a, b) => b.count - a.count));
    setSelectedLanguages(Object.keys(allLanguages));
    setLicenses(Object.values(allLicenses).sort((a, b) => b.count - a.count));
    setSelectedLicenses(Object.keys(allLicenses));
    setVisibility(Object.values(allVisibility).sort((a, b) => b.count - a.count));
    setSelectedVisibility(Object.keys(allVisibility));
  }, [tools]);

  useEffect(() => {
    setFilteredTools(tools.filter((item) =>
      selectedLanguages.includes(normalize(item?.language ?? normalize(FALLBACK_CHECKBOX_LABEL)))
      && selectedLicenses.includes(item?.license?.key ?? normalize(FALLBACK_CHECKBOX_LABEL))
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
          {(visibility.length > 0) && (
            <CheckboxGroup
              legend="Visibilité"
            >
              {
                visibility.map((item) => (
                  <Checkbox
                    checked={selectedVisibility.includes(item.key)}
                    key={item.key}
                    label={`${item.label} (${item.count})`}
                    onChange={() => onVisibilityChange(item.key)}
                  />
                ))
              }
            </CheckboxGroup>
          )}
          {(licenses.length > 0) && (
            <CheckboxGroup
              legend="Licences"
            >
              {
                licenses.map((item) => (
                  <Checkbox
                    checked={selectedLicenses.includes(item.key)}
                    key={item.key}
                    label={`${item.label} (${item.count})`}
                    onChange={() => onLicensesChange(item.key)}
                  />
                ))
              }
            </CheckboxGroup>
          )}
          {(languages.length > 0) && (
            <CheckboxGroup
              legend="Langage"
            >
              {
                languages.map((item) => (
                  <Checkbox
                    checked={selectedLanguages.includes(item.key)}
                    key={item.key}
                    label={`${item.label} (${item.count})`}
                    onChange={() => onLanguagesChange(item.key)}
                  />
                ))
              }
            </CheckboxGroup>
          )}
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