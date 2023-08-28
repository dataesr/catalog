import {
  Col,
  Container,
  Icon,
  Link,
  Row,
  Tag,
  TagGroup,
  Text,
} from "@dataesr/react-dsfr";
import { useEffect, useState } from "react";

import CheckAvailability from "./check-availibility";
import { capitalize } from "../utils/string";

const getNameFromLogin = (login) => {
  const logins = {
    annelhote: "Anne",
    ericjeangirard: "Eric",
    folland87: "Frédéric",
    hfsllt: "Hafsa",
    jerem1508: "Jérémy",
    juliaGrandhay: "Julia",
    miarkt: "Mialy",
    Mihoub2: "Mihoub",
    poplingue: "Pauline",
    toutestprismemeca: "Zoé",
    yaca29: "Yann",
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
        const response = await fetch(
          `${import.meta.env.VITE_GITHUB_URL_CONTRIBUTORS.replace(
            "/REPO/",
            `/${tool.name}/`
          )}repo=${tool.name}`
        );
        const body = await response.json();
        setContributors(Object.keys(body).map((key) => body[key]));
      } catch (error) {
        console.error("Error while fetching contributors", error);
      }
    }
    setContributors([]);
    fetchContributors();
  }, [tool]);

  return (
    <Container>
      {tool?.name && (
        <Row>
          <Col>
            <Text as="h1">
              {capitalize(tool.name).replaceAll("_", " ").replaceAll("-", " ")}
            </Text>{" "}
          </Col>
        </Row>
      )}
      {tool?.homepage && (
        <Row>
          <Col>
            <Text>
              Availability <CheckAvailability url={tool?.homepage} />
            </Text>
          </Col>
        </Row>
      )}
      {tool?.staging && (
        <Row>
          <Col>
            <Text>
              Staging <CheckAvailability url={tool?.staging} />
            </Text>
          </Col>
        </Row>
      )}
      {tool?.private && (
        <Row>
          <Col>
            <Text>
              Private repo{" "}
              <Icon size="lg" name="ri-git-repository-private-line" />
            </Text>
          </Col>
        </Row>
      )}
      {tool?.updated_at && (
        <Row>
          <Col>
            <Text>
              <Icon size="lg" name="ri-history-line" />
              Last update {formatDate(tool.updated_at)}
            </Text>
          </Col>
        </Row>
      )}
      {contributors && (
        <Row gutters className="fr-my-2w">
          <Col className="custom-container-style">
            <Text>Contributors</Text>
            <TagGroup>
              {contributors.map((contributor) => (
                <Tag icon="ri-github-line" key={contributor.login}>
                  <Link href={contributor.html_url} target="_blank">
                    {getNameFromLogin(contributor.login)}
                  </Link>
                </Tag>
              ))}
            </TagGroup>
          </Col>
        </Row>
      )}
      {tool?.topics?.length > 0 && (
        <Row gutters>
          <Col className="custom-container-style">
            <Text>Topics</Text>
            <TagGroup>
              {tool.topics
                .filter((topic) => !!topic)
                .map((topic, index) => (
                  <Tag icon="ri-price-tag-3-line" key={index}>
                    {console.log(tool)}
                    {topic}
                  </Tag>
                ))}
            </TagGroup>
          </Col>
        </Row>
      )}
      {tool?.contact && (
        <Row>
          <Text>Contact</Text>
          <Icon name="ri-mail-line" />
          {tool.contact}
        </Row>
      )}
    </Container>
  );
}
