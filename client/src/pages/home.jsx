import {
  Checkbox,
  CheckboxGroup,
  Col,
  Container,
  Row,
} from "@dataesr/react-dsfr";
import { useEffect, useState } from "react";

import SelectedTool from "../components/selected-tool";
import { Spinner } from "../components/spinner";
import ToolCard from "../components/tool-card";
import publicMetadata from "../data/meta.json";

const { VITE_GITHUB_URL_REPOS, VITE_PRIVATE_METADATA_URL } = import.meta.env;

const FALLBACK_CHECKBOX_LABEL = "None";
const GITHUB_PER_PAGE = 30;

const normalize = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-zA-Z0-9]/g, "");

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

  const handleToolCardClick = () => {
    window.scrollTo(0, 250);
  };

  const onLanguagesChange = (itemKey) => {
    if (selectedLanguages.includes(itemKey)) {
      const selectedLanguagesCopy = [...selectedLanguages].filter(
        (item) => item !== itemKey
      );
      setSelectedLanguages(selectedLanguagesCopy);
    } else {
      setSelectedLanguages([...selectedLanguages, itemKey]);
    }
  };

  const onLicensesChange = (itemKey) => {
    if (selectedLicenses.includes(itemKey)) {
      const selectedLicensesCopy = [...selectedLicenses].filter(
        (item) => item !== itemKey
      );
      setSelectedLicenses(selectedLicensesCopy);
    } else {
      setSelectedLicenses([...selectedLicenses, itemKey]);
    }
  };

  const onVisibilityChange = (itemKey) => {
    if (selectedVisibility.includes(itemKey)) {
      const selectedVisibilityCopy = [...selectedVisibility].filter(
        (item) => item !== itemKey
      );
      setSelectedVisibility(selectedVisibilityCopy);
    } else {
      setSelectedVisibility([...selectedVisibility, itemKey]);
    }
  };

  useEffect(() => {
    const toolsTmp = {};
    async function fetchTools({ page }) {
      try {
        const response = await fetch(`${VITE_GITHUB_URL_REPOS}page=${page}`);
        const repositories = await response.json();
        repositories.forEach(
          (repository) => (toolsTmp[repository.name] = repository)
        );
        if (repositories.length === GITHUB_PER_PAGE) {
          fetchTools({ page: page + 1 });
        } else {
          // Override with public metadata
          Object.keys(publicMetadata).forEach((name) => {
            toolsTmp[name] = { ...toolsTmp?.[name], ...publicMetadata[name] };
          });
          // Override with private metadata
          let privateMetadata = {};
          try {
            const response = await fetch("/api/privatemetadata");
            privateMetadata = await response.json();
          } catch (e) {}
          Object.keys(privateMetadata).forEach((name) => {
            toolsTmp[name] = { ...toolsTmp?.[name], ...privateMetadata[name] };
          });
          setTools(Object.values(toolsTmp));
        }
      } catch (error) {
        console.error("Error while fetching repos : ", error);
      }
    }
    fetchTools({ page: 1 });
  }, []);

  useEffect(() => {
    const allLanguages = {};
    const allLicenses = {};
    const allVisibility = {
      private: { key: "private", label: "Private", count: 0 },
      public: { key: "public", label: "Public", count: 0 },
    };
    tools.forEach((tool) => {
      const language = tool?.language ?? FALLBACK_CHECKBOX_LABEL;
      if (!allLanguages?.[normalize(language)])
        allLanguages[normalize(language)] = {
          key: normalize(language),
          label: language,
          count: 0,
        };
      allLanguages[normalize(language)].count += 1;
      const license = tool?.license
        ? tool.license
        : {
            key: normalize(FALLBACK_CHECKBOX_LABEL),
            name: FALLBACK_CHECKBOX_LABEL,
          };
      if (!allLicenses?.[license.key])
        allLicenses[license.key] = {
          key: license.key,
          label: license.name,
          count: 0,
        };
      allLicenses[license.key].count += 1;
      tool?.private
        ? (allVisibility.private.count += 1)
        : (allVisibility.public.count += 1);
    });
    setLanguages(Object.values(allLanguages).sort((a, b) => b.count - a.count));
    setSelectedLanguages(Object.keys(allLanguages));
    setLicenses(Object.values(allLicenses).sort((a, b) => b.count - a.count));
    setSelectedLicenses(Object.keys(allLicenses));
    setVisibility(
      Object.values(allVisibility).sort((a, b) => b.count - a.count)
    );
    setSelectedVisibility(Object.keys(allVisibility));
  }, [tools]);

  useEffect(() => {
    setFilteredTools(
      tools.filter(
        (item) =>
          selectedLanguages.includes(
            normalize(item?.language ?? normalize(FALLBACK_CHECKBOX_LABEL))
          ) &&
          selectedLicenses.includes(
            item?.license?.key ?? normalize(FALLBACK_CHECKBOX_LABEL)
          ) &&
          selectedVisibility.includes(item?.private ? "private" : "public")
      )
    );
  }, [selectedLanguages, selectedLicenses, selectedVisibility]);

  return (
    <Container className="fr-my-5w">
      <Row gutters className="custom-container-style">
        <Col n="12" offset="5">
          <h2>Filters</h2>
          <span>
            <i>{`${filteredTools.length}/${tools.length} projects`}</i>
          </span>
        </Col>
        <Col n="3">
          {visibility.length > 0 && (
            <CheckboxGroup legend="Visibility">
              {visibility.map((item) => (
                <Checkbox
                  checked={selectedVisibility.includes(item.key)}
                  key={item.key}
                  label={`${item.label} (${item.count})`}
                  onChange={() => onVisibilityChange(item.key)}
                />
              ))}
            </CheckboxGroup>
          )}
        </Col>
        <Col n="3">
          {licenses.length > 0 && (
            <CheckboxGroup legend="Licenses">
              {licenses.map((item) => (
                <Checkbox
                  checked={selectedLicenses.includes(item.key)}
                  key={item.key}
                  label={`${item.label} (${item.count})`}
                  onChange={() => onLicensesChange(item.key)}
                />
              ))}
            </CheckboxGroup>
          )}
        </Col>
        <Col n="6">
          {languages.length > 0 && (
            <CheckboxGroup isInline legend="Languages">
              {languages.map((item) => (
                <Checkbox
                  checked={selectedLanguages.includes(item.key)}
                  key={item.key}
                  label={`${item.label} (${item.count})`}
                  onChange={() => onLanguagesChange(item.key)}
                />
              ))}
            </CheckboxGroup>
          )}
        </Col>
      </Row>
      <Row gutters className="fr-my-5w">
        <Col n="6">
          {filteredTools.length > 0 ? (
            <div>
              {filteredTools.map((tool) => (
                <Row gutters>
                  <Col>
                    <ToolCard
                      setSelectedTool={() => {
                        setSelectedTool(tool);
                        handleToolCardClick();
                      }}
                      tool={tool}
                    />
                  </Col>
                </Row>
              ))}
            </div>
          ) : (
            <Spinner />
          )}
        </Col>
        {selectedTool && (
          <Col n="6">
            <SelectedTool tool={selectedTool} />
          </Col>
        )}
      </Row>
    </Container>
  );
}
